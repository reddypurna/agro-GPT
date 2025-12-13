from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, nullable=False)
    email = Column(String(254), unique=True, nullable=False)

    # IMPORTANT — This must exist for login to work
    password = Column(String(512), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
