import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.models.user import UserModel
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserProfileResponse
)
from app.auth.password import verify_password, get_password_hash
from app.auth.jwt import create_access_token, get_current_user_id

router = APIRouter(tags=["User Authentication"])

@router.post("/auth/register", response_model=TokenResponse)
async def register_user(request: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check existing user
    stmt = select(UserModel).where((UserModel.email == request.email) | (UserModel.username == request.username))
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username or email already registered.")

    new_user = UserModel(
        id=f"user_{uuid.uuid4().hex[:8]}",
        email=request.email,
        username=request.username,
        hashed_password=get_password_hash(request.password),
        role="Researcher",
        xp=100,
        level=1,
        quizzes_completed=0
    )
    db.add(new_user)
    await db.commit()

    token = create_access_token({"sub": new_user.id, "username": new_user.username})
    return TokenResponse(access_token=token)

@router.post("/auth/login", response_model=TokenResponse)
async def login_user(request: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(UserModel).where(UserModel.username == request.username)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password credentials.")

    token = create_access_token({"sub": user.id, "username": user.username})
    return TokenResponse(access_token=token)

@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserModel).where(UserModel.id == current_user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        # Fallback guest profile
        return UserProfileResponse(
            id="guest_1",
            email="botanist@herbivore.org",
            username="MedicinalExplorer",
            role="Researcher",
            xp=450,
            level=3,
            quizzesCompleted=4
        )

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        role=user.role,
        xp=user.xp,
        level=user.level,
        quizzesCompleted=user.quizzes_completed
    )
