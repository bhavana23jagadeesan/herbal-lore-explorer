from pydantic import BaseModel
from typing import List, Dict, Optional

class QuizQuestionSchema(BaseModel):
    id: str
    question: str
    options: List[str]
    plantId: Optional[str] = None

class QuizSubmitRequest(BaseModel):
    answers: Dict[str, str]

class QuizSubmitResultSchema(BaseModel):
    score: int
    total: int
    xpEarned: int
    correctAnswers: Dict[str, str]
