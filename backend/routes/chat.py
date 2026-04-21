from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import uuid
from services.groq_service import chat_response
from engine.decision_engine import get_recommendations
from services.weather_service import get_goa_weather

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str
    
class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    history: List[ChatMessage] = []

@router.post("/message")
def send_chat_message(request: ChatMessageRequest):
    # Build context from current weather
    weather = get_goa_weather()
    wea_desc = weather.get("description", "Sunny")
    wea_temp = str(weather.get("temp", "30"))
    
    # Build context from Decision Engine top 3 features
    top_locations = get_recommendations()
    top_names = [loc["name"] for loc in top_locations[:3]]
    
    context = (
        f"Right now in Goa it is {wea_temp}°C and {wea_desc}. "
        f"The top 3 recommended locations based on current real-time crowds and scores are: {', '.join(top_names)}."
    )
    
    conv_id = request.conversation_id or str(uuid.uuid4())
    hist_dicts = [m.model_dump() for m in request.history]
    
    # Send dynamically calculated prompt logic
    reply = chat_response(request.message, hist_dicts, context)
    
    return {
        "response": reply,
        "conversation_id": conv_id
    }

@router.get("/suggestions")
def get_suggestions():
    return [
        "What are the least crowded beaches right now?",
        "Recommend a 2-day budget itinerary.",
        "Where can I find the best seafood?",
        "Is Dudhsagar waterfall open today?",
        "What's the weather like in South Goa?",
        "Suggest a good sunset spot nearby."
    ]
