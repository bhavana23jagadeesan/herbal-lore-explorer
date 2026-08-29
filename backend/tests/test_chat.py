import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_chat_assistant():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/chat", json={
            "question": "What plants treat cough and fever?"
        })
        assert res.status_code == 200
        data = res.json()
        assert "answer" in data
        assert "sources" in data
