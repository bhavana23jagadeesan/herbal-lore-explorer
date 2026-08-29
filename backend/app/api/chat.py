import re
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any

from app.database.session import get_db
from app.models.plant import PlantModel
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.openrouter import generate_grounded_answer

router = APIRouter(prefix="/chat", tags=["AI Assistant"])

STOP_WORDS = {
    "for", "the", "and", "can", "you", "please", "say", "some", "remedy", "remedies",
    "what", "how", "much", "is", "it", "are", "tell", "give", "me", "any", "which",
    "have", "has", "had", "with", "from", "about", "does", "do", "get", "if", "plat", "plant"
}

def is_clean_ascii_english(text: str) -> bool:
    if not text or "#value" in text.lower() or "nan" in text.lower():
        return False
    ascii_count = sum(1 for c in text if ord(c) < 128)
    return (ascii_count / max(1, len(text))) > 0.6

@router.post("", response_model=ChatResponse)
async def chat_assistant(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    question_lower = request.question.lower()
    raw_words = [w for w in re.split(r'[^a-zA-Z0-9]', question_lower) if len(w) > 2]
    content_words = [w for w in raw_words if w not in STOP_WORDS]

    stmt = select(PlantModel)
    res = await db.execute(stmt)
    all_plants = res.scalars().all()

    matched_plants = []
    seen_ids = set()

    if content_words:
        for p in all_plants:
            c_names = " ".join([c.get("name", "").lower() for c in (p.common_names or []) if is_clean_ascii_english(c.get("name", ""))])
            full_text = f"{p.name} {p.botanical_name} {c_names} {' '.join(p.uses or [])} {' '.join(p.diseases or [])} {' '.join(p.constituents or [])}".lower()

            if (
                p.name.lower() in question_lower
                or p.botanical_name.lower() in question_lower
                or any(w in p.name.lower() for w in content_words)
                or any(w in p.botanical_name.lower() for w in content_words)
                or any(w in c_names for w in content_words)
                or any(w in full_text for w in content_words)
            ):
                if p.id not in seen_ids and is_clean_ascii_english(p.name):
                    seen_ids.add(p.id)
                    matched_plants.append({
                        "name": p.name,
                        "botanical_name": p.botanical_name,
                        "family": p.family,
                        "uses": [u for u in (p.uses or []) if is_clean_ascii_english(u)],
                        "diseases": [d for d in (p.diseases or []) if is_clean_ascii_english(d)],
                        "constituents": [c for c in (p.constituents or []) if is_clean_ascii_english(c)],
                        "pharmacology": [ph for ph in (p.pharmacology or []) if is_clean_ascii_english(ph)],
                        "siddha": p.siddha or {}
                    })

    matched_plants = matched_plants[:4]

    result = await generate_grounded_answer(request.question, matched_plants)
    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"]
    )
