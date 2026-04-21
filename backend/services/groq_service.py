import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

GROQ_KEY = os.environ.get("GROQ_API_KEY", "").strip()
client = Groq(api_key=GROQ_KEY) if GROQ_KEY and GROQ_KEY != "your_groq_api_key" else None
MODEL_NAME = "llama-3.1-8b-instant"

def generate_itinerary(locations, days, budget, preferences, weather):
    """Create detailed, realistic day-wise itineraries returning JSON."""
    if not client:
        # Graceful Mock Fallback (Step 21 explicit instructions)
        return {
            "day1": [{"time": "09:00", "activity": "Arrival & Welcome to Goa!", "location": locations[0] if locations else "Baga Beach", "tip": "Settle in early to beat the crowds and enjoy the sea breeze!"}],
            "day2": [{"time": "10:30", "activity": "Historical Exploration", "location": locations[1] if len(locations)>1 else "Old Goa Churches", "tip": "Mock route: Add an active Groq API key to .env for real inference!"}]
        }

    system_prompt = (
        "You are GoaMind, an expert Goa travel guide. Create detailed, realistic day-wise itineraries. "
        "Include timings, travel tips, food suggestions, and local insights. Format as structured JSON. "
        "You must return ONLY valid JSON with no markdown blocks. "
        "Format example: {\"day1\": [{\"time\": \"09:00\", \"activity\": \"...\", \"location\": \"...\", \"tip\": \"...\"}]}"
    )
    user_prompt = (
        f"Generate a {days}-day '{budget}' budget itinerary in Goa.\n"
        f"Preferences: {preferences}.\n"
        f"Potential locations to include: {locations}.\n"
        f"Current Weather expectation: {weather}."
    )
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        return {"error": str(e)}

def chat_response(user_message, conversation_history, context):
    """Provide a helpful friendly text chat response."""
    if not client:
        return "I'm currently running in Demo Mode since `GROQ_API_KEY` is missing in the .env files. Provide a key to unlock my intelligence!"

    system_prompt = (
        f"You are GoaMind, a friendly and knowledgeable Goa travel assistant. "
        f"You know about beaches, food, culture, transport, safety, and hidden gems. "
        f"Be concise, helpful, and enthusiastic. Context: {context}"
    )
    
    messages = [{"role": "system", "content": system_prompt}]
    
    # Append prior history safely
    for msg in conversation_history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
    messages.append({"role": "user", "content": user_message})
    
    try:
        completion = client.chat.completions.create(
            messages=messages,
            model=MODEL_NAME,
            temperature=0.7
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

def explain_recommendation(location, score, factors):
    """Short 2-sentence explanation of why a location is recommended right now."""
    if not client:
        return "Highly recommended based on current real-time metrics (Demonstration fallback mapped)."

    system_prompt = "You are a concise travel assistant. Explain in exactly 2 short sentences why to visit this location right now."
    user_prompt = f"Location: {location.get('name') if isinstance(location, dict) else location}. Score: {score}. Expected factors: {factors}."
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME,
            temperature=0.5
        )
        return completion.choices[0].message.content
    except Exception as e:
        return "Highly recommended safely based on current real-time metrics."
