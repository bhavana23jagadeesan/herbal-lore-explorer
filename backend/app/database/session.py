import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/herbivore_db")
SQLITE_FALLBACK_URL = os.getenv("SQLITE_FALLBACK_URL", "sqlite+aiosqlite:///./mpi_herbivore.db")

Base = declarative_base()

# Attempt async engine creation
try:
    if "sqlite" in DATABASE_URL:
        engine = create_async_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_async_engine(DATABASE_URL, echo=False)
except Exception:
    engine = create_async_engine(SQLITE_FALLBACK_URL, connect_args={"check_same_thread": False})

AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
