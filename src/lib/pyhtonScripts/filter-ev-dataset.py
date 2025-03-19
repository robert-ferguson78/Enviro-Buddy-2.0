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

def calculate_charging_time(dc_charger, battery_size):
    """Calculate total charging time from 0% to 100%"""
    if not dc_charger or "charging_curve" not in dc_charger:
        return None

    charging_curve = sorted(dc_charger["charging_curve"], key=lambda x: x["percentage"])
    total_time = 0
    charging_efficiency = 0.95

    for i in range(len(charging_curve) - 1):
        start = charging_curve[i]
        end = charging_curve[i + 1]

        percentage_diff = end["percentage"] - start["percentage"]
        energy_to_add = (percentage_diff / 100) * battery_size / charging_efficiency

        avg_power = (start["power"] + end["power"]) / 2
        if avg_power > 0:
            segment_time = (energy_to_add / avg_power) * 60
            total_time += segment_time

    return round(total_time, 2)

def calculate_15min_charge_range(dc_charger, battery_size, energy_consumption):
    """Calculate range added during a 15-minute charge"""
    if not dc_charger or "charging_curve" not in dc_charger:
        return 0

    charging_curve = sorted(dc_charger["charging_curve"], key=lambda x: x["percentage"])
    charging_efficiency = 0.95
    initial_soc = 20  # Start charging at 20% SOC for optimal charging speed

    # Find initial charging power at 20% SOC
    initial_power = None
    for i in range(len(charging_curve) - 1):
        if charging_curve[i]["percentage"] <= initial_soc <= charging_curve[i + 1]["percentage"]:
            power_diff = charging_curve[i + 1]["power"] - charging_curve[i]["power"]
            percentage_diff = charging_curve[i + 1]["percentage"] - charging_curve[i]["percentage"]
            initial_power = charging_curve[i]["power"] + (power_diff * (initial_soc - charging_curve[i]["percentage"]) / percentage_diff)
            break

    if initial_power is None:
        initial_power = charging_curve[0]["power"]

    # Calculate energy added in 15 minutes
    energy_added = (initial_power * 15 / 60) * charging_efficiency  # kWh

    # Convert energy to range
    range_added = (energy_added / energy_consumption) * 100
    return round(range_added, 2)

# Load and process the dataset
with open("ev-data.json", "r") as file:
    data = json.load(file)

# Process vehicles
filtered_data = []
for vehicle in data["data"]:
    if vehicle["brand"].lower() in target_brands:
        battery_size = vehicle.get("usable_battery_size", 0)
        energy_consumption = vehicle.get("energy_consumption", {}).get("average_consumption", 0)
        dc_charger = vehicle.get("dc_charger")

        if battery_size > 0 and energy_consumption > 0:
            # Calculate WLTP range
            wltp_range = calculate_wltp_range(battery_size, energy_consumption)
            vehicle["wltp_range_km"] = round(wltp_range, 2)

            # Calculate weather-specific ranges
            vehicle["weather_ranges"] = {
                condition: calculate_weather_range(battery_size, energy_consumption, condition)
                for condition in weather_factors.keys()
            }

            # Calculate charging times
            if dc_charger:
                vehicle["total_charge_time_minutes"] = calculate_charging_time(dc_charger, battery_size)
                vehicle["range_added_15min_charge_km"] = calculate_15min_charge_range(
                    dc_charger, battery_size, energy_consumption
                )

        filtered_data.append(vehicle)

# Save the filtered dataset
filtered_dataset = {"data": filtered_data}
with open("filtered-ev-data-with-charging.json", "w") as output_file:
    json.dump(filtered_dataset, output_file, indent=4)

print(f"Processing complete. Filtered dataset saved with {len(filtered_data)} vehicles")