from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

class CommonNameSchema(BaseModel):
    language: str
    name: str

class ResearchEvidenceSchema(BaseModel):
    title: str
    journal: str
    year: int
    finding: str
    evidenceLevel: str

class SiddhaSchema(BaseModel):
    name: str
    suvai: str
    veeryam: str
    note: str

class PlantBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True, serialize_by_alias=True)

    id: str
    name: str
    botanicalName: str = Field(alias="botanical_name")
    family: str
    commonNames: List[CommonNameSchema] = Field(default=[], alias="common_names")
    regions: List[str] = []
    parts: List[str] = []
    morphology: Optional[str] = None
    uses: List[str] = []
    diseases: List[str] = []
    constituents: List[str] = []
    pharmacology: List[str] = []
    siddha: SiddhaSchema
    research: List[ResearchEvidenceSchema] = []
    conservation: str = "Least Concern"
    popularity: int = 50
    hue: int = 150

class PaginatedPlantResponse(BaseModel):
    items: List[PlantBase]
    total: int
    page: int
    pages: int
    limit: int
