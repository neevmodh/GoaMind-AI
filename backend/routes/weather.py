from fastapi import APIRouter
from services.weather_service import get_goa_weather, get_goa_forecast

router = APIRouter()

@router.get("/")
def get_current_weather():
    return get_goa_weather()

@router.get("/forecast")
def get_weather_forecast():
    return get_goa_forecast()
