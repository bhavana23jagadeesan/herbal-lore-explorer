from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any

from app.database.session import get_db
from app.models.plant import PlantModel
from app.schemas.plant import PlantBase
from app.recommendations.engine import calculate_plant_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/{plant_id}", response_model=List[PlantBase])
async def get_recommendations(plant_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(PlantModel)
    res = await db.execute(stmt)
    plants = res.scalars().all()

    all_plants_dict = []
    for p in plants:
        all_plants_dict.append({
            "id": p.id,
            "name": p.name,
            "botanical_name": p.botanical_name,
            "family": p.family,
            "common_names": p.common_names or [],
            "regions": p.regions or [],
            "parts": p.parts or [],
            "morphology": p.morphology,
            "uses": p.uses or [],
            "diseases": p.diseases or [],
            "constituents": p.constituents or [],
            "pharmacology": p.pharmacology or [],
            "siddha": p.siddha or {},
            "research": p.research or [],
            "conservation": p.conservation,
            "popularity": p.popularity,
            "hue": p.hue
        })

    recs = calculate_plant_recommendations(plant_id, all_plants_dict, top_n=3)

    return [
        PlantBase(
            id=r["id"],
            name=r["name"],
            botanical_name=r["botanical_name"],
            family=r["family"],
            common_names=r["common_names"],
            regions=r["regions"],
            parts=r["parts"],
            morphology=r["morphology"],
            uses=r["uses"],
            diseases=r["diseases"],
            constituents=r["constituents"],
            pharmacology=r["pharmacology"],
            siddha=r["siddha"],
            research=r["research"],
            conservation=r["conservation"],
            popularity=r["popularity"],
            hue=r["hue"]
        )
        for r in recs
    ]
