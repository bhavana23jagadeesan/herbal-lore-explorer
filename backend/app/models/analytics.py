from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from app.database.session import Base

class AnalyticsLogModel(Base):
    __tablename__ = "analytics_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query_type = Column(String, index=True) # "search", "view", "chat"
    target_id = Column(String, nullable=True) # plant_id or query term
    user_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
