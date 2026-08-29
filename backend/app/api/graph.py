from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, List

from app.database.session import get_db
from app.models.plant import PlantModel

router = APIRouter(prefix="/knowledge-graph", tags=["Knowledge Graph"])

@router.get("", response_model=Dict[str, Any])
async def get_knowledge_graph(db: AsyncSession = Depends(get_db)):
    stmt = select(PlantModel)
    res = await db.execute(stmt)
    plants = res.scalars().all()

    nodes: List[Dict[str, str]] = []
    edges: List[Dict[str, str]] = []

    for p in plants:
        p_id = f"plant:{p.id}"
        nodes.append({"id": p_id, "label": p.name, "type": "plant"})

        for d in (p.diseases or [])[:2]:
            d_id = f"disease:{d.lower().replace(' ', '_')}"
            if not any(n["id"] == d_id for n in nodes):
                nodes.append({"id": d_id, "label": d, "type": "disease"})
            edges.append({"source": p_id, "target": d_id, "relationship": "treats"})

        for c in (p.constituents or [])[:2]:
            c_id = f"compound:{c.lower().replace(' ', '_')}"
            if not any(n["id"] == c_id for n in nodes):
                nodes.append({"id": c_id, "label": c, "type": "compound"})
            edges.append({"source": p_id, "target": c_id, "relationship": "contains"})

        if p.regions and len(p.regions) > 0:
            r = p.regions[0]
            r_id = f"region:{r.lower().replace(' ', '_')}"
            if not any(n["id"] == r_id for n in nodes):
                nodes.append({"id": r_id, "label": r, "type": "region"})
            edges.append({"source": p_id, "target": r_id, "relationship": "native_to"})

    return {"nodes": nodes, "edges": edges}
