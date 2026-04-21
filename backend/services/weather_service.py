import os
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY")

def get_goa_weather() -> dict:
    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "your_openweather_key":
        return {
            "temp": 28,
            "feels_like": 31,
            "humidity": 75,
            "description": "Sunny with sea breeze",
            "wind_speed": 14,
            "icon": "01d"
        }
    
    url = f"https://api.openweathermap.org/data/2.5/weather?q=Goa,IN&appid={OPENWEATHER_API_KEY}&units=metric"
    try:
        response = httpx.get(url)
        response.raise_for_status()
        data = response.json()
        return {
            "temp": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
            "icon": data["weather"][0]["icon"]
        }
    except Exception as e:
        return {
            "temp": 29.5,
            "feels_like": 33.2,
            "humidity": 75,
            "description": f"error fallback: {str(e)}",
            "wind_speed": 4.1,
            "icon": "04d"
        }

def get_goa_forecast() -> list:
    if not OPENWEATHER_API_KEY:
        return [
            {"date": "2026-04-22 12:00:00", "temp": 30.0, "description": "clear sky"},
            {"date": "2026-04-23 12:00:00", "temp": 29.5, "description": "few clouds"},
            {"date": "2026-04-24 12:00:00", "temp": 28.0, "description": "light rain"},
            {"date": "2026-04-25 12:00:00", "temp": 30.2, "description": "sunny"},
            {"date": "2026-04-26 12:00:00", "temp": 31.0, "description": "clear sky"}
        ]
        
    url = f"https://api.openweathermap.org/data/2.5/forecast?q=Goa,IN&appid={OPENWEATHER_API_KEY}&units=metric"
    try:
        response = httpx.get(url)
        response.raise_for_status()
        data = response.json()
        forecasts = []
        # OWM returns 3h timestamps -> 8 blocks = 24 hours. Grab 1 block per day.
        for item in data.get("list", [])[0:40:8]: 
            forecasts.append({
                "date": item["dt_txt"],
                "temp": item["main"]["temp"],
                "description": item["weather"][0]["description"]
            })
        return forecasts
    except Exception:
        return [
            {"date": "Error", "temp": 0.0, "description": "Failed to fetch"}
        ]
