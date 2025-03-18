# Initial implementation with target brand filtering

import json

# Define target brands
target_brands = [
    "alfaromeo", "audi", "bmw", "byd", "citroen", "cupra", "dacia", "ds",
    "fiat", "ford", "hyundai", "jeep", "kia", "mazda", "mini", "mitsubishi",
    "nissan", "opel", "peugeot", "polestar", "renault", "seat", "skoda",
    "smart", "tesla", "toyota", "volkswagen", "volvo", "xpeng"
]

# Load the dataset
with open("ev-data.json", "r") as file:
    data = json.load(file)

# Process vehicles
filtered_data = []
for vehicle in data["data"]:
    if vehicle["brand"].lower() in target_brands:
        filtered_data.append(vehicle)

# Save the filtered dataset
filtered_dataset = {"data": filtered_data}
with open("filtered-ev-data.json", "w") as output_file:
    json.dump(filtered_dataset, output_file, indent=4)

print(f"Processing complete. Filtered dataset saved with {len(filtered_data)} vehicles")