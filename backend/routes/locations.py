import os
import pandas as pd
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from engine.decision_engine import get_recommendations

router = APIRouter()

LOCATIONS_CSV = os.path.join(os.path.dirname(__file__), '../data/locations.csv')
CROWD_PATTERNS_CSV = os.path.join(os.path.dirname(__file__), '../data/crowd_patterns.csv')

class LocationBase(BaseModel):
    name: str
    category: str
    latitude: float
    longitude: float
    description: str
    eco_score: int
    budget_level: str
    tags: str
    image_url: Optional[str] = ""

@router.get("/")
def get_locations(
    category: Optional[str] = None,
    budget_level: Optional[str] = None,
    min_eco_score: Optional[int] = None
):
    if not os.path.exists(LOCATIONS_CSV):
        return []

    df = pd.read_csv(LOCATIONS_CSV)
    df = df.fillna("")

    # Filter operations
    if category:
        df = df[df['category'] == category]
    if budget_level:
        df = df[df['budget_level'] == budget_level]
    if min_eco_score is not None:
        df = df[df['eco_score'] >= min_eco_score]

    now = datetime.now()
    current_hour = now.hour
    current_day = now.weekday()

    if os.path.exists(CROWD_PATTERNS_CSV):
        crowd_df = pd.read_csv(CROWD_PATTERNS_CSV)
        current_crowds = crowd_df[(crowd_df['hour'] == current_hour) & (crowd_df['day_of_week'] == current_day)]
        merged = pd.merge(df, current_crowds[['location_id', 'crowd_level', 'crowd_label']], left_on='id', right_on='location_id', how='left')
        merged = merged.drop(columns=['location_id'], errors='ignore')
        # Fill missing crowds if any
        merged['crowd_level'] = merged['crowd_level'].fillna(-1).astype(int)
        merged['crowd_label'] = merged['crowd_label'].fillna("unknown")
    else:
        merged = df
        merged['crowd_level'] = -1
        merged['crowd_label'] = "unknown"

    return merged.to_dict(orient="records")

@router.get("/recommended")
def get_recommended():
    # Calls the decision engine (Step 7)
    return get_recommendations()

@router.get("/{loc_id}")
def get_location(loc_id: int):
    df = pd.read_csv(LOCATIONS_CSV)
    loc_row = df[df['id'] == loc_id]
    
    if loc_row.empty:
        raise HTTPException(status_code=404, detail="Location not found")
        
    loc_dict = loc_row.fillna("").iloc[0].to_dict()
    
    if os.path.exists(CROWD_PATTERNS_CSV):
        now = datetime.now()
        crowd_df = pd.read_csv(CROWD_PATTERNS_CSV)
        today_crowds = crowd_df[(crowd_df['location_id'] == loc_id) & (crowd_df['day_of_week'] == now.weekday())]
        loc_dict["crowd_patterns_today"] = today_crowds[['hour', 'crowd_level', 'crowd_label']].to_dict(orient="records")
    else:
        loc_dict["crowd_patterns_today"] = []
        
    return loc_dict

@router.post("/")
def create_location(location: LocationBase):
    df = pd.read_csv(LOCATIONS_CSV)
    new_id = int(df['id'].max() + 1) if not df.empty else 1
    
    new_row = {"id": new_id, **location.model_dump()}
    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    df.to_csv(LOCATIONS_CSV, index=False)
    
    return new_row

@router.put("/{loc_id}")
def update_location(loc_id: int, location: LocationBase):
    df = pd.read_csv(LOCATIONS_CSV)
    
    if loc_id not in df['id'].values:
        raise HTTPException(status_code=404, detail="Location not found")
        
    idx = df[df['id'] == loc_id].index[0]
    
    for key, value in location.model_dump().items():
        df.at[idx, key] = value
        
    df.to_csv(LOCATIONS_CSV, index=False)
    
    updated_dict = df.loc[idx].fillna("").to_dict()
    # ensure primitive types
    updated_dict['id'] = int(updated_dict['id'])
    return updated_dict

@router.delete("/{loc_id}")
def delete_location(loc_id: int):
    df = pd.read_csv(LOCATIONS_CSV)
    
    if loc_id not in df['id'].values:
        raise HTTPException(status_code=404, detail="Location not found")
        
    df = df[df['id'] != loc_id]
    df.to_csv(LOCATIONS_CSV, index=False)
    
    return {"message": "deleted", "id": loc_id}
