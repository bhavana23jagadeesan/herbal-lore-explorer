from sqlalchemy import Column, String, Integer, Float, Text, JSON
from app.database.session import Base

class PlantModel(Base):
    __tablename__ = "plants"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    botanical_name = Column(String, index=True, nullable=False)
    family = Column(String, index=True)
    common_names = Column(JSON, default=list) # [{language: "", name: ""}]
    regions = Column(JSON, default=list) # ["Tamil Nadu", ...]
    parts = Column(JSON, default=list) # ["Leaf", ...]
    morphology = Column(Text, nullable=True)
    uses = Column(JSON, default=list) # ["Cough and cold", ...]
    diseases = Column(JSON, default=list) # ["Fever", ...]
    constituents = Column(JSON, default=list) # ["Eugenol", ...]
    pharmacology = Column(JSON, default=list) # ["Adaptogenic", ...]
    siddha = Column(JSON, default=dict) # {name: "", suvai: "", veeryam: "", note: ""}
    research = Column(JSON, default=list) # [{title: "", journal: "", year: 2020, finding: "", evidenceLevel: ""}]
    conservation = Column(String, default="Least Concern")
    popularity = Column(Integer, default=50)
    hue = Column(Integer, default=150)
