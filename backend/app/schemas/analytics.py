from pydantic import BaseModel
from typing import List

class PopularPlantMetric(BaseModel):
    plantId: str
    name: str
    count: int

class SearchTrendMetric(BaseModel):
    term: str
    count: int

class UserStatsMetric(BaseModel):
    totalPlants: int
    totalSearches: int
    totalUsers: int
    totalQuizzes: int
