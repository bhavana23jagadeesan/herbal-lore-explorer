import re
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List, Dict, Any

from app.database.session import get_db
from app.models.plant import PlantModel
from app.schemas.plant import PaginatedPlantResponse, PlantBase

router = APIRouter(prefix="/plants", tags=["Plants"])

def is_clean_ascii_english(text: str) -> bool:
    if not text or "#value" in text.lower() or "nan" in text.lower():
        return False
    ascii_count = sum(1 for c in text if ord(c) < 128)
    return (ascii_count / max(1, len(text))) > 0.6

def check_keyword_match(query: Optional[str], target_list: List[str], extra_text: str = "") -> bool:
    if not query:
        return True
    
    raw_tokens = re.split(r'[/,;\s]+', query.strip().lower())
    tokens = [t for t in raw_tokens if t and t not in ["all", "and", "or", "&"]]
    if not tokens:
        return True

    combined_target = " ".join(target_list).lower() + " " + extra_text.lower()
    return any(token in combined_target for token in tokens)

def compute_match_score(p: PlantModel, plant_name: Optional[str], medicinal_use: Optional[str], disease: Optional[str], region: Optional[str]) -> int:
    score = 0
    common_names_text = " ".join([c.get("name", "") for c in (p.common_names or [])])

    if plant_name and check_keyword_match(plant_name, [p.name, p.botanical_name], common_names_text):
        score += 3
    if medicinal_use and check_keyword_match(medicinal_use, p.uses or [], p.morphology or ""):
        score += 2
    if disease and check_keyword_match(disease, p.diseases or [], (p.morphology or "") + " " + " ".join(p.uses or [])):
        score += 2
    if region and check_keyword_match(region, p.regions or [], common_names_text):
        score += 2

    return score

@router.get("/filters")
async def get_filter_options(db: AsyncSession = Depends(get_db)):
    stmt = select(PlantModel)
    res = await db.execute(stmt)
    plants = res.scalars().all()

    diseases = set()
    uses = set()

    for p in plants:
        for d in (p.diseases or []):
            if d and is_clean_ascii_english(d) and len(d.strip()) > 2:
                diseases.add(d.strip().capitalize())
        for u in (p.uses or []):
            if u and is_clean_ascii_english(u) and len(u.strip()) > 2:
                uses.add(u.strip().capitalize())

    return {
        "diseases": sorted(list(diseases))[:16],
        "uses": sorted(list(uses))[:16],
        "regions": ["Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Andhra Pradesh", "Uttar Pradesh", "Pan-India"]
    }

@router.get("", response_model=PaginatedPlantResponse)
async def get_plants(
    plant_name: Optional[str] = Query(None),
    botanical_name: Optional[str] = Query(None),
    medicinal_use: Optional[str] = Query(None),
    disease: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(PlantModel)
    res = await db.execute(stmt)
    plants = res.scalars().all()

    # Step 1: Strict AND matching
    filtered = []
    for p in plants:
        common_names_text = " ".join([c.get("name", "") for c in (p.common_names or [])])

        match_name = check_keyword_match(plant_name, [p.name, p.botanical_name], common_names_text)
        match_botanical = check_keyword_match(botanical_name, [p.botanical_name]) if botanical_name else True
        match_use = check_keyword_match(medicinal_use, p.uses or [], p.morphology or "")
        match_disease = check_keyword_match(disease, p.diseases or [], (p.morphology or "") + " " + " ".join(p.uses or []))
        match_region = check_keyword_match(region, p.regions or [], common_names_text)

        if match_name and match_botanical and match_use and match_disease and match_region:
            filtered.append(p)

    # Step 2: Fallback to scored relevance matching if strict AND yields 0 items
    if len(filtered) == 0 and (plant_name or medicinal_use or disease or region):
        scored_plants = []
        for p in plants:
            score = compute_match_score(p, plant_name, medicinal_use, disease, region)
            if score > 0:
                scored_plants.append((score, p))
        
        scored_plants.sort(key=lambda x: x[0], reverse=True)
        filtered = [item[1] for item in scored_plants]

    # Step 3: Global safety fallback if still empty
    if len(filtered) == 0:
        filtered = plants

    total = len(filtered)
    pages = (total + limit - 1) // limit if total > 0 else 1
    start = (page - 1) * limit
    paginated_items = filtered[start:start + limit]

    items_out = []
    for item in paginated_items:
        items_out.append(PlantBase(
            id=item.id,
            name=item.name,
            botanical_name=item.botanical_name,
            family=item.family,
            common_names=item.common_names or [],
            regions=item.regions or [],
            parts=item.parts or [],
            morphology=item.morphology,
            uses=item.uses or [],
            diseases=item.diseases or [],
            constituents=item.constituents or [],
            pharmacology=item.pharmacology or [],
            siddha=item.siddha or {"name": "", "suvai": "", "veeryam": "", "note": ""},
            research=item.research or [],
            conservation=item.conservation,
            popularity=item.popularity,
            hue=item.hue
        ))

    return PaginatedPlantResponse(
        items=items_out,
        total=total,
        page=page,
        pages=pages,
        limit=limit
    )

@router.get("/{plant_id}", response_model=PlantBase)
async def get_plant_by_id(plant_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(PlantModel).where((PlantModel.id == plant_id) | (PlantModel.name.ilike(plant_id)))
    res = await db.execute(stmt)
    plant = res.scalar_one_or_none()

    if not plant:
        raise HTTPException(status_code=404, detail="Plant record not found in IEEE MPI dataset.")

    return PlantBase(
        id=plant.id,
        name=plant.name,
        botanical_name=plant.botanical_name,
        family=plant.family,
        common_names=plant.common_names or [],
        regions=plant.regions or [],
        parts=plant.parts or [],
        morphology=plant.morphology,
        uses=plant.uses or [],
        diseases=plant.diseases or [],
        constituents=plant.constituents or [],
        pharmacology=plant.pharmacology or [],
        siddha=plant.siddha or {"name": "", "suvai": "", "veeryam": "", "note": ""},
        research=plant.research or [],
        conservation=plant.conservation,
        popularity=plant.popularity,
        hue=plant.hue
    )
