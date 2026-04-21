import csv
import random
import os

locations_csv = 'locations.csv'
crowds_csv = 'crowd_patterns.csv'

# Hours 6 to 22 (inclusive)
hours = list(range(6, 23))
# Days 0 to 6 (Monday to Sunday)
days = list(range(7))

# Logic for realistic crowd peaks
def get_crowd_level(loc_category, loc_id, hour, day):
    base = random.randint(1, 3) 
    
    # Weekends (5: Sat, 6: Sun) have higher modifier
    weekend_modifier = 2 if day >= 5 else 0
    
    # Patterns based on category
    if loc_category == 'beach':
        if 16 <= hour <= 19: # Sunset time
            base += random.randint(4, 5)
        elif 10 <= hour <= 15: # Midday sun
            base += random.randint(1, 4)
    elif loc_category == 'nightlife' or (loc_category == 'beach' and loc_id in [1, 4, 11]):
        if hour >= 20: # Evening/night parties
            base += random.randint(5, 7)
    elif loc_category == 'nature' or loc_category == 'adventure':
        if 8 <= hour <= 12: # Morning is best
            base += random.randint(3, 5)
        elif hour >= 18: # Drops at night
            base = 1
    elif loc_category == 'heritage':
        if 9 <= hour <= 11 or 15 <= hour <= 17:
            base += random.randint(3, 5)
    elif loc_category == 'food': # Markets
        if 12 <= hour <= 14 or 18 <= hour <= 21:
            base += random.randint(4, 6)
            
    level = min(10, base + weekend_modifier)
    level = max(1, level)
    
    if level <= 3:
        label = "low"
    elif level <= 6:
        label = "moderate"
    elif level <= 8:
        label = "high"
    else:
        label = "very_high"
        
    return level, label

# Read locations to get their category and id
locs_info = {}
if os.path.exists(locations_csv):
    with open(locations_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            locs_info[int(row['id'])] = row['category']
else:
    # Fallback if somehow not present during generation
    for i in range(1, 16):
        locs_info[i] = 'beach'

# Write crowd patterns
with open(crowds_csv, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['location_id', 'hour', 'day_of_week', 'crowd_level', 'crowd_label'])
    
    for loc_id, cat in locs_info.items():
        for day in days:
            for hour in hours:
                lvl, label = get_crowd_level(cat, loc_id, hour, day)
                writer.writerow([loc_id, hour, day, lvl, label])

print(f"Successfully generated {len(locs_info)*len(days)*len(hours)} rows in {crowds_csv}")
