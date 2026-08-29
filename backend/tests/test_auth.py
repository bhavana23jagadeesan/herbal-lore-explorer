import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_auth_register_and_login():
    unique_username = f"testuser_{uuid.uuid4().hex[:6]}"
    unique_email = f"{unique_username}@herbivore.org"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register
        reg_res = await ac.post("/api/auth/register", json={
            "email": unique_email,
            "username": unique_username,
            "password": "testpassword123"
        })
        assert reg_res.status_code == 200
        assert "access_token" in reg_res.json()

        # Login
        login_res = await ac.post("/api/auth/login", json={
            "username": unique_username,
            "password": "testpassword123"
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()
