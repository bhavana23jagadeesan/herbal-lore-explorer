import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_get_plants_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/plants")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] > 0

@pytest.mark.asyncio
async def test_get_plant_by_id():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # First get list of plants
        list_res = await ac.get("/api/plants")
        assert list_res.status_code == 200
        items = list_res.json()["items"]
        assert len(items) > 0

        target_id = items[0]["id"]
        response = await ac.get(f"/api/plants/{target_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == target_id
        assert "name" in data
