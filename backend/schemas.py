# this file contains the schemas for the backend application
# and is used to define the data models for the application.

from pydantic import BaseModel, EmailStr, constr
from typing import Optional

# User registration schema
class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=50)
    email: EmailStr
    password: constr(min_length=6)
    role: Optional[str] = "user"  # Only 'admin' or 'user', default 'user'

# User response schema (for returning user info)
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    class Config:
        orm_mode = True

# Token schema (for login/refresh responses)
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

# Token data for internal use
class TokenData(BaseModel):
    email: Optional[str] = None
    token_type: Optional[str] = None

# User profile schema
class UserProfile(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: Optional[str]
    class Config:
        orm_mode = True