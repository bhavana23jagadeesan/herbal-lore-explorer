from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any

from app.database.session import get_db
from app.models.plant import PlantModel
from app.services.identify_service import identify_plant_image

router = APIRouter(prefix="/identify", tags=["Image Identification"])

@router.post("", response_model=Dict[str, Any])
async def identify_plant(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded must be an image.")

    contents = await file.read()

    stmt = select(PlantModel)
    res = await db.execute(stmt)
    plants = res.scalars().all()

    plant_dicts = []
    for p in plants:
        plant_dicts.append({
            "id": p.id,
            "name": p.name,
            "botanicalName": p.botanical_name,
            "family": p.family,
            "uses": p.uses or [],
            "diseases": p.diseases or []
        })

    result = identify_plant_image(contents, plant_dicts)
    return result
