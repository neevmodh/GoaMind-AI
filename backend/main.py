import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

# Route imports
from routes import locations, itinerary, chat, weather

app = FastAPI(title="GoaMind 2.0 API")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all 4 routers
app.include_router(locations.router, prefix="/api/locations", tags=["Locations"])
app.include_router(itinerary.router, prefix="/api/itinerary", tags=["Itinerary"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat Focus"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "project": "GoaMind 2.0"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
