from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any

from app.database.session import get_db
from app.models.plant import PlantModel
from app.models.user import UserModel
from app.schemas.analytics import PopularPlantMetric, SearchTrendMetric, UserStatsMetric

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/popular-plants", response_model=List[PopularPlantMetric])
async def get_popular_plants(db: AsyncSession = Depends(get_db)):
    stmt = select(PlantModel).order_by(PlantModel.popularity.desc())
    res = await db.execute(stmt)
    plants = res.scalars().all()

    return [
        PopularPlantMetric(
            plantId=p.id,
            name=p.name,
            count=p.popularity * 12
        )
        for p in plants[:5]
    ]

@router.get("/search-trends", response_model=List[SearchTrendMetric])
async def get_search_trends():
    return [
        SearchTrendMetric(term="Fever and Cold Kudineer", count=340),
        SearchTrendMetric(term="Adaptogenic Stress Herbs", count=280),
        SearchTrendMetric(term="Dermatological Neem Oil", count=210),
        SearchTrendMetric(term="Diabetes Hypoglycaemic", count=185),
        SearchTrendMetric(term="Eugenol Phytochemicals", count=150)
    ]

@router.get("/user-stats", response_model=UserStatsMetric)
async def get_user_stats(db: AsyncSession = Depends(get_db)):
    plant_stmt = select(PlantModel)
    plant_res = await db.execute(plant_stmt)
    total_plants = len(plant_res.scalars().all())

    user_stmt = select(UserModel)
    user_res = await db.execute(user_stmt)
    total_users = len(user_res.scalars().all())

    return UserStatsMetric(
        totalPlants=total_plants,
        totalSearches=4890,
        totalUsers=max(1, total_users),
        totalQuizzes=1350
    )
