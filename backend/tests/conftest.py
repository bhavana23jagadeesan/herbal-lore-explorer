import pytest_asyncio
from app.database.seed import init_db_and_seed

@pytest_asyncio.fixture(autouse=True, scope="function")
async def setup_database():
    await init_db_and_seed()
