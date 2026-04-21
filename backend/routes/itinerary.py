from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.groq_service import generate_itinerary
from engine.decision_engine import get_recommendations
from services.weather_service import get_goa_weather

router = APIRouter()

class ItineraryGenerateRequest(BaseModel):
    days: int
    budget: str
    preferences: List[str]
    start_date: str

@router.post("/generate")
def generate_itinerary_route(request: ItineraryGenerateRequest):
    # Fetch top locations
    prefs = {"budget": request.budget}
    top_locations = get_recommendations(prefs)
    location_names = [loc["name"] for loc in top_locations]
    
    # Get weather
    weather_data = get_goa_weather()
    weather_desc = weather_data.get("description", "Sunny")
    weather_temp = weather_data.get("temp", "30")
    weather_context = f"{weather_desc}, {weather_temp}°C"
    
    # Generate Itinerary dict natively
    itinerary_json = generate_itinerary(
        locations=location_names,
        days=request.days,
        budget=request.budget,
        preferences=request.preferences,
        weather=weather_context
    )
    
    return itinerary_json

@router.get("/templates")
def get_templates():
    return [
        {"name": "Beach Lover", "days": 3, "preferences": ["beach", "party", "sunset"], "budget": "medium"},
        {"name": "Heritage Explorer", "days": 2, "preferences": ["heritage", "history", "culture"], "budget": "low"},
        {"name": "Adventure Seeker", "days": 4, "preferences": ["adventure", "nature", "trekking"], "budget": "high"}
    ]
