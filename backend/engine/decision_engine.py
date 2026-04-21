import random
import os
import pandas as pd
from datetime import datetime
from services.weather_service import get_goa_weather

class DecisionEngine:
    def score_location(self, location, crowd_level, weather, user_prefs):
        """
        Calculate a score 0-100 for a location.
        """
        # crowd_score: weight 0.30
        crowd_val = float(crowd_level) if crowd_level != -1 else 5.0
        crowd_score = (10 - crowd_val) * 10
        
        # weather_score: weight 0.25
        desc = weather.get("description", "").lower()
        if "rain" in desc or "drizzle" in desc:
            weather_val = 40
        elif "storm" in desc or "thunder" in desc:
            weather_val = 20
        elif "cloud" in desc:
            weather_val = 70
        else: # sunny, clear
            weather_val = 90
        weather_score = weather_val
        
        # eco_score: weight 0.20
        eco_score = float(location.get("eco_score", 5)) * 10
        
        # budget_score: weight 0.15
        pref_budget = user_prefs.get("budget", "medium")
        loc_budget = location.get("budget_level", "medium")
        if pref_budget == loc_budget:
            budget_score = 100
        elif (pref_budget == "high" and loc_budget == "low") or (pref_budget == "low" and loc_budget == "high"):
            budget_score = 30
        else:
            budget_score = 70
            
        # distance_score: weight 0.10
        distance_score = random.randint(50, 100)
        
        # Final Score Integration
        final_score = (crowd_score * 0.30) + (weather_score * 0.25) + (eco_score * 0.20) + (budget_score * 0.15) + (distance_score * 0.10)
        
        label, color = self.get_crowd_label(crowd_val)
        temp = weather.get("temp", "--")
        
        explanation = f"Recommended because: crowds are {label} ({int(crowd_val)}/10), weather is {desc} ({temp}°C), and eco-friendly score is {int(location.get('eco_score', 0))}/10."
        
        return {
            **location,
            "score": round(final_score, 1),
            "explanation": explanation,
            "crowd_color": color,
            "current_crowd_label": label
        }

    def rank_locations(self, locations, crowd_data_df, weather, user_prefs):
        """Score all locations and return sorted list with scores and explanations"""
        scored_locations = []
        
        now = datetime.now()
        current_hour = now.hour
        current_day = now.weekday()
        
        current_crowds = crowd_data_df[(crowd_data_df['hour'] == current_hour) & (crowd_data_df['day_of_week'] == current_day)]
        
        for loc in locations:
            # Match crowd pattern
            c_row = current_crowds[current_crowds['location_id'] == loc['id']]
            crowd_level = c_row.iloc[0]['crowd_level'] if not c_row.empty else -1
            
            scored = self.score_location(loc, crowd_level, weather, user_prefs)
            scored_locations.append(scored)
            
        # Sort top descending
        scored_locations.sort(key=lambda x: x['score'], reverse=True)
        return scored_locations

    def get_crowd_label(self, crowd_level):
        """Return color code too: low=green, moderate=yellow, high=orange, very_high=red"""
        if crowd_level <= 3:
            return ("low", "green")
        elif crowd_level <= 6:
            return ("moderate", "yellow")
        elif crowd_level <= 8:
            return ("high", "orange")
        else:
            return ("very_high", "red")

# Connects to Step 5 GET /api/locations/recommended endpoint
def get_recommendations(user_prefs=None):
    if user_prefs is None:
        user_prefs = {"budget": "medium"}
        
    engine = DecisionEngine()
    
    loc_path = os.path.join(os.path.dirname(__file__), '../data/locations.csv')
    loc_df = pd.read_csv(loc_path).fillna("")
    locations = loc_df.to_dict(orient="records")
    
    crowd_path = os.path.join(os.path.dirname(__file__), '../data/crowd_patterns.csv')
    crowd_df = pd.read_csv(crowd_path)
    
    weather = get_goa_weather()
    
    ranked = engine.rank_locations(locations, crowd_df, weather, user_prefs)
    return ranked[:5]
