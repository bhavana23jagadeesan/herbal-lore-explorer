import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_recommendations_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        list_res = await ac.get("/api/plants")
        items = list_res.json()["items"]
        target_id = items[0]["id"]

        res = await ac.get(f"/api/recommendations/{target_id}")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
