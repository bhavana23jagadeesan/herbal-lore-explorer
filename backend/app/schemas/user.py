from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    username: str
    role: str
    xp: int
    level: int
    quizzesCompleted: int
