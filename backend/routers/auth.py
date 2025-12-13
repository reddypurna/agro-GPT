from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models_user import User
from passlib.context import CryptContext
from pydantic import BaseModel

router = APIRouter(tags=["Authentication"])

# ✔ Using sha256_crypt (NO bcrypt)
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")


# ======== Request Models ========
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# ======== REGISTER USER ========
@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):

    # Check email exists
    user_exists = db.query(User).filter(User.email == req.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password using sha256_crypt
    hashed_password = pwd_context.hash(req.password)

    new_user = User(
        username=req.username,
        email=req.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "user_id": new_user.id}


# ======== LOGIN USER ========
@router.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == req.email).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Verify password (sha256_crypt)
    if not pwd_context.verify(req.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {"message": "Login successful", "user_id": user.id}
