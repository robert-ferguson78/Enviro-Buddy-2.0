# Initial implementation with target brand filtering

import json

# Define target brands
target_brands = [
    "alfaromeo", "audi", "bmw", "byd", "citroen", "cupra", "dacia", "ds",
    "fiat", "ford", "hyundai", "jeep", "kia", "mazda", "mini", "mitsubishi",
    "nissan", "opel", "peugeot", "polestar", "renault", "seat", "skoda",
    "smart", "tesla", "toyota", "volkswagen", "volvo", "xpeng"
]

# Define body type mappings
body_type_mapping = {
    #Audi
    "Q4 e-tron": "SUV",
    "Q4 Sportback e-tron": "SUV Coupe",
    "Q6 e-tron": "SUV",
    "Q8 e-tron": "SUV",
    "Q8 Sportback e-tron": "SUV Coupe",
    "e-tron GT": "Saloon",
    "RS e-tron GT": "Saloon",
    "GT": "Saloon",
    "SQ6 e-tron": "SUV",
    "e-tron 50": "SUV",
    "e-tron 55": "SUV",
    "e-tron S": "SUV",

    #BMW
    "i3": "Hatchback",
    "i3S": "Hatchback",
    "i4": "Saloon",
    "i5": "Saloon",
    "i7": "Saloon",
    "iX": "SUV",
    "iX1": "SUV",
    "iX2": "SUV",
    "iX3": "SUV",

    #BYD
    "ATTO 3": "SUV",
    "Dolphin": "Hatchback",
    "HAN": "Saloon",
    "Seal": "Saloon",
    "TANG": "SUV",

    #Cupra
    "Born": "Hatchback",
    "Tavascan": "SUV Coupe",

    #Dacia
    "Spring Electric": "City Car",

    #Fiat
    "500e": "City Car",
    "600e": "Crossover",

    #Ford
    "Focus electric": "Hatchback",
    "Mustang Mach e": "SUV",

    #Hyundai
    "IONIQ 5": "Crossover",
    "IONIQ 6": "Saloon",
    "Kona Electric": "SUV",
    "Ioniq": "Saloon",
    "Kona": "SUV",

    #Jeep
    "Avenger": "SUV",

    #Kia
    "EV6": "Crossover",
    "EV9": "SUV",
    "Niro EV": "Crossover",
    "Soul EV": "Crossover",
    "Soul": "Crossover",
    "e-Niro": "Crossover",
    "e-Soul": "Crossover",

    #Mazda
    "MX-30": "Crossover",

    #Mini
    "Cooper SE": "Hatchback",
    "Cooper": "Hatchback",
    "Countryman": "SUV",
    "Aceman": "Crossover",

    #Mitsubishi
    "i-Miev": "City Car",

    #Nissan
    "Ariya": "Crossover",
    "Leaf": "Hatchback",
    "e-NV 200": "Van",

    #Peugeot
    "E-Expert": "Van",
    "E-Traveller": "Van",
    "I-on": "City Car",
    "Partner": "Van",
    "e-2008": "Crossover",
    "e-208": "Hatchback",
    "e-3008": "SUV",
    "e-Partner": "Van",

    #Polestar
    "2": "Fastback",
    "3": "SUV",
    "4": "SUV Coupe",

    #Reanult
    "Kangoo ZE": "Van",
    "Zoe": "Hatchback",
    "Megane E-Tech": "Crossover",
    "Scenic": "SUV",
    "Twingo Z.E.": "City Car",
    "5 E-Tech": "Hatchback",

    #Seat
    "Mii Electric": "City Car",

    #Smart
    "#1": "SUV",
    "#3": "SUV Coupe",
    "forfour EQ": "City Car",
    "fortwo ED": "City Car",
    "fortwo EQ": "City Car",

    #Skoda
    "CITIGOe iV": "City Car",
    "Enyaq iV": "SUV",
    "Enyaq": "SUV",
    "Elroq": "SUV",
    "Enyaq Coupe": "SUV Coupe",

    #Tesla
    "Roadster": "Convertible",
    "Model 3": "Saloon",
    "Model S": "Saloon",
    "Model X": "SUV",
    "Model Y": "SUV",

    #Toyota
    "ProAce City Electric": "Van",
    "ProAce Electric": "Van",

    #Volkswagen
    "ID.Buzz": "Van",
    "e-up": "City Car",
    "ID.3": "Hatchback",
    "ID.4": "SUV",
    "ID.5": "SUV Coupe",
    "ID.7": "Saloon",
    "e-Golf": "Hatchback",

    #Volvo
    "C40": "SUV Coupe",
    "EX30": "SUV",
    "EX90": "SUV",
    "XC40": "SUV",

    #Renault
    "Twizy": "Quadricycle",

    #Xpeng
    "P5": "Saloon",

}

def get_body_type(brand, model, variant=""):
    """Get body type based on brand, model and variant"""
    if model in body_type_mapping:
        return body_type_mapping[model]

    # Try matching model without variant info
    base_model = model.split()[0]
    if base_model in body_type_mapping:
        return body_type_mapping[base_model]

    return "Unknown"

def calculate_wltp_range(battery_size, energy_consumption):
    """Calculate WLTP range in kilometers"""
    if battery_size <= 0 or energy_consumption <= 0:
        return 0
    return (battery_size / energy_consumption) * 100

def calculate_weather_ranges(battery_size, energy_consumption):
    """
    Calculate weather-specific ranges based on real-world data and research
    References: EV Database, Recurrent Auto studies, AAA testing data
    """
    weather_factors = {
        "cold": {  # -10°C
            "battery_efficiency": 0.85,  # 15% reduction
            "hvac_consumption": 0.35,    # kWh/100km for heating
            "driving_resistance": 1.08    # 8% more resistance
        },
        "mild": {  # 23°C conditions (baseline)
            "battery_efficiency": 1.0,    # No reduction
            "hvac_consumption": 0.1,      # Minimal HVAC usage
            "driving_resistance": 1.0     # Baseline resistance
        },
        "warm": {  # 30°C
            "battery_efficiency": 0.97,   # 3% reduction
            "hvac_consumption": 0.25,     # kWh/100km for cooling
            "driving_resistance": 1.03    # 3% more resistance
        }
    }

    ranges = {}
    for condition, factors in weather_factors.items():
        # Calculate effective battery capacity
        effective_battery = battery_size * factors["battery_efficiency"]

        # Calculate total energy consumption per km
        base_consumption = energy_consumption / 100  # kWh/km
        hvac_consumption = factors["hvac_consumption"] / 100  # kWh/km
        total_consumption = (base_consumption * factors["driving_resistance"]) + hvac_consumption

        # Calculate range
        range_km = (effective_battery / total_consumption)
        ranges[condition] = round(range_km, 2)

    return ranges

def calculate_total_charge_time(dc_charger, battery_size):
    """
    Calculate total charging time considering charging curve
    """
    if not dc_charger or "charging_curve" not in dc_charger:
        return None

    charging_curve = sorted(dc_charger["charging_curve"], key=lambda x: x["percentage"])
    total_time = 0
    charging_efficiency = 0.95  # Updated efficiency factor

    for i in range(len(charging_curve) - 1):
        start = charging_curve[i]
        end = charging_curve[i + 1]

        # Calculate energy needed for this segment
        percentage_diff = end["percentage"] - start["percentage"]
        energy_to_add = (percentage_diff / 100) * battery_size

        # Account for charging efficiency
        energy_to_add = energy_to_add / charging_efficiency

        # Calculate average power for this segment
        avg_power = (start["power"] + end["power"]) / 2

        # Calculate time in minutes
        if avg_power > 0:
            segment_time = (energy_to_add / avg_power) * 60
            total_time += segment_time

    return round(total_time, 2)

def calculate_15min_charge_range(dc_charger, battery_size, energy_consumption):
    """
    Calculate range added during a 15-minute DC fast charge
    Assumes starting at 20% SOC for optimal charging speed
    """
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
unknown_body_types = set()

for vehicle in data["data"]:
    if vehicle["brand"].lower() in target_brands:
        battery_size = vehicle.get("usable_battery_size", 0)
        energy_consumption = vehicle.get("energy_consumption", {}).get("average_consumption", 0)
        dc_charger = vehicle.get("dc_charger")

        # Add body type
        brand = vehicle["brand"]
        model = vehicle["model"]
        variant = vehicle.get("variant", "")
        body_type = get_body_type(brand, model, variant)
        vehicle["body_type"] = body_type

        if body_type == "Unknown":
            unknown_body_types.add(f"{brand} {model}")

        if battery_size > 0 and energy_consumption > 0:
            # Calculate WLTP range
            wltp_range = calculate_wltp_range(battery_size, energy_consumption)
            vehicle["wltp_range_km"] = round(wltp_range, 2)

            # Calculate weather-specific ranges
            vehicle["weather_ranges"] = calculate_weather_ranges(battery_size, energy_consumption)

            # Calculate charging times and ranges if DC charging is available
            if dc_charger:
                # Calculate total charging time
                total_time = calculate_total_charge_time(dc_charger, battery_size)
                vehicle["total_charge_time_minutes"] = total_time

                # Calculate range added by 15-minute charge
                range_added = calculate_15min_charge_range(dc_charger, battery_size, energy_consumption)
                vehicle["range_added_15min_charge_km"] = range_added

        filtered_data.append(vehicle)

# Save the filtered and updated dataset
filtered_dataset = {"data": filtered_data}
with open("filtered-ev-data-with-body-types.json", "w") as output_file:
    json.dump(filtered_dataset, output_file, indent=4)

# Print summary
print(f"\nProcessing complete. Updated dataset saved with {len(filtered_data)} vehicles")
print(f"Successfully added body types to {len(filtered_data) - len(unknown_body_types)} vehicles")

if unknown_body_types:
    print("\nModels without body type mapping:")
    for model in sorted(unknown_body_types):
        print(f"- {model}")
    print("\nPlease add these models to the body_type_mapping dictionary for complete coverage")

# Print sample of updated data
print("\nSample of updated vehicles:")
for vehicle in filtered_data[:3]:
    print(f"{vehicle['brand']} {vehicle['model']}: {vehicle['body_type']}")
    print(f"  WLTP Range: {vehicle.get('wltp_range_km', 'N/A')} km")
    print(f"  Weather Ranges: {vehicle.get('weather_ranges', 'N/A')}")
    print(f"  15min Charge Range: {vehicle.get('range_added_15min_charge_km', 'N/A')} km")
    print()