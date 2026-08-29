from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from app.database.session import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Researcher")
    xp = Column(Integer, default=100)
    level = Column(Integer, default=1)
    quizzes_completed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
