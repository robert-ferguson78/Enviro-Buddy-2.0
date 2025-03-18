# Initial implementation with target brand filtering

import json

# Define target brands
target_brands = [
    "alfaromeo", "audi", "bmw", "byd", "citroen", "cupra", "dacia", "ds",
    "fiat", "ford", "hyundai", "jeep", "kia", "mazda", "mini", "mitsubishi",
    "nissan", "opel", "peugeot", "polestar", "renault", "seat", "skoda",
    "smart", "tesla", "toyota", "volkswagen", "volvo", "xpeng"
]

# Define weather adjustment factors
weather_factors = {
    "cold": {  # -10°C conditions
        "battery_efficiency": 0.75,  # 25% reduction in battery efficiency
        "hvac_consumption": 0.4,     # Additional kWh/100km for heating
        "driving_resistance": 1.15    # 15% increase in driving resistance
    },
    "mild": {  # 23°C conditions (baseline)
        "battery_efficiency": 1.0,    # No reduction
        "hvac_consumption": 0.1,      # Minimal HVAC usage
        "driving_resistance": 1.0     # Baseline resistance
    },
    "warm": {  # 30°C conditions
        "battery_efficiency": 0.9,    # 10% reduction in battery efficiency
        "hvac_consumption": 0.25,     # Additional kWh/100km for cooling
        "driving_resistance": 1.05    # 5% increase in driving resistance
    }
}

def calculate_wltp_range(battery_size, energy_consumption):
    """Calculate WLTP range in kilometers"""
    if battery_size <= 0 or energy_consumption <= 0:
        return 0
    return (battery_size / energy_consumption) * 100

def calculate_weather_range(battery_size, energy_consumption, weather_condition):
    """Calculate range for specific weather conditions"""
    if battery_size <= 0 or energy_consumption <= 0:
        return 0

    factors = weather_factors[weather_condition]
    effective_battery = battery_size * factors["battery_efficiency"]
    base_consumption = energy_consumption / 100  # Convert to kWh/km
    hvac_consumption = factors["hvac_consumption"] / 100  # Convert to kWh/km

    # Calculate total consumption including weather effects
    total_consumption = (base_consumption * factors["driving_resistance"]) + hvac_consumption

    # Calculate range
    range_km = (effective_battery / total_consumption)
    return round(range_km, 2)

# Load the dataset
with open("ev-data.json", "r") as file:
    data = json.load(file)

# Process vehicles
filtered_data = []
for vehicle in data["data"]:
    if vehicle["brand"].lower() in target_brands:
        battery_size = vehicle.get("usable_battery_size", 0)
        energy_consumption = vehicle.get("energy_consumption", {}).get("average_consumption", 0)

        if battery_size > 0 and energy_consumption > 0:
            # Calculate WLTP range
            wltp_range = calculate_wltp_range(battery_size, energy_consumption)
            vehicle["wltp_range_km"] = round(wltp_range, 2)

            # Calculate weather-specific ranges
            vehicle["weather_ranges"] = {
                condition: calculate_weather_range(battery_size, energy_consumption, condition)
                for condition in weather_factors.keys()
            }

        filtered_data.append(vehicle)

# Save the filtered dataset
filtered_dataset = {"data": filtered_data}
with open("filtered-ev-data-with-weather.json", "w") as output_file:
    json.dump(filtered_dataset, output_file, indent=4)

print(f"Processing complete. Filtered dataset saved with {len(filtered_data)} vehicles")