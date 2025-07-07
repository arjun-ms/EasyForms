from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import schemas, models
from .database import get_db

# JWT Configuration
SECRET_KEY = "YOUR_SECRET_KEY_HERE"  # Generate a secure key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120 #- this is for debugging purposes
REFRESH_TOKEN_EXPIRE_DAYS = 7 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/login")

# Token Creation Function
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception, token_type: str = "access", db: Session = None):
    print("🔑 Token:", token)
    
    try:
        if db:
            blacklisted = db.query(models.BlacklistedToken).filter(
                models.BlacklistedToken.token == token).first()
            print("🛑 Blacklisted token found:", bool(blacklisted))
            if blacklisted:
                raise credentials_exception
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("📦 Payload:", payload)

        email: str = payload.get("sub")
        token_payload_type: str = payload.get("type")

        if email is None:
            print("🚫 Email is None")
            raise credentials_exception

        if token_payload_type != token_type:
            print("🚫 Token type mismatch:", token_payload_type)
            raise credentials_exception

        token_data = schemas.TokenData(email=email, token_type=token_type)
        print("✅ Token verified successfully")
        return token_data
    except JWTError as e:
        print("⚠️ JWTError:", e)
        raise credentials_exception

# User Authentication Dependency
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    print("Token received:", token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token, credentials_exception, "access")
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user