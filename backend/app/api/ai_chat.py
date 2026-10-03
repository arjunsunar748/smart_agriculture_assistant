from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.ai.assistant import ai_assistant
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse

router = APIRouter(prefix="/ai", tags=["AI Agriculture Assistant"])

@router.post("/chat", response_model=ChatMessageResponse)
async def chat_with_agri_assistant(req: ChatMessageRequest, db: Session = Depends(get_db)):
    result = await ai_assistant.chat(
        db=db,
        message=req.message,
        district=req.district or "Kathmandu",
        farming_method=req.farming_method or "tunnel",
        language=req.language or "ne",
        conversation_history=req.conversation_history
    )
    return ChatMessageResponse(
        reply=result["reply"],
        data_context_used=result["data_context_used"],
        suggested_questions=result["suggested_questions"],
        timestamp=result["timestamp"]
    )
