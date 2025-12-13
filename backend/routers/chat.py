from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models_chat import Chat

router = APIRouter(prefix="/chat", tags=["Chat"])


# Save a chat message
@router.post("/send")
def save_chat(user_id: int, question: str, answer: str, db: Session = Depends(get_db)):
    chat = Chat(user_id=user_id, question=question, answer=answer)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return {"message": "Chat saved successfully", "chat_id": chat.id}


# Get full chat history of a user
@router.get("/history/{user_id}")
def chat_history(user_id: int, db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(Chat.user_id == user_id).all()
    return chats
