from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any

from app.database.session import get_db
from app.models.plant import PlantModel
from app.models.user import UserModel
from app.schemas.quiz import QuizQuestionSchema, QuizSubmitRequest, QuizSubmitResultSchema
from app.quiz.generator import generate_quiz_questions, evaluate_quiz_submission
from app.auth.jwt import get_current_user_id

router = APIRouter(prefix="/quiz", tags=["Quiz Engine"])

@router.get("", response_model=List[QuizQuestionSchema])
async def get_quiz(db: AsyncSession = Depends(get_db)):
    stmt = select(PlantModel)
    res = await db.execute(stmt)
    plants = res.scalars().all()

    plant_dicts = []
    for p in plants:
        plant_dicts.append({
            "id": p.id,
            "name": p.name,
            "botanical_name": p.botanical_name,
            "uses": p.uses or [],
            "constituents": p.constituents or []
        })

    questions = generate_quiz_questions(plant_dicts)
    return [QuizQuestionSchema(**q) for q in questions]

@router.post("/submit", response_model=QuizSubmitResultSchema)
async def submit_quiz(
    request: QuizSubmitRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(PlantModel)
    res = await db.execute(stmt)
    plants = res.scalars().all()

    plant_dicts = [{"id": p.id, "name": p.name} for p in plants]

    evaluation = evaluate_quiz_submission(request.answers, plant_dicts)

    # Award XP to authenticated user
    if current_user_id:
        user_stmt = select(UserModel).where(UserModel.id == current_user_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        if user:
            user.xp += evaluation["xpEarned"]
            user.quizzes_completed += 1
            user.level = max(1, user.xp // 150)
            await db.commit()

    return QuizSubmitResultSchema(**evaluation)
