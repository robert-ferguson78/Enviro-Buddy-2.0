# Initial implementation with target brand filtering

import json

# Define target brands
target_brands = [
    "alfaromeo", "audi", "bmw", "byd", "citroen", "cupra", "dacia", "ds",
    "fiat", "ford", "hyundai", "jeep", "kia", "mazda", "mini", "mitsubishi",
    "nissan", "opel", "peugeot", "polestar", "renault", "seat", "skoda",
    "smart", "tesla", "toyota", "volkswagen", "volvo", "xpeng"
]

def calculate_wltp_range(battery_size, energy_consumption):
    """Calculate WLTP range in kilometers"""
    if battery_size <= 0 or energy_consumption <= 0:
        return 0
    return (battery_size / energy_consumption) * 100

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
            wltp_range = calculate_wltp_range(battery_size, energy_consumption)
            vehicle["wltp_range_km"] = round(wltp_range, 2)

        filtered_data.append(vehicle)

# Save the filtered dataset
filtered_dataset = {"data": filtered_data}
with open("filtered-ev-data-with-range.json", "w") as output_file:
    json.dump(filtered_dataset, output_file, indent=4)

print(f"Processing complete. Filtered dataset saved with {len(filtered_data)} vehicles")