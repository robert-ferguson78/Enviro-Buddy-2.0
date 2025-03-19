import json

# Load the JSON file
input_file = "filtered-ev-data-with-body-types.json"
output_file = "filtered-ev-data-without-unknown-body-types.json"
unknown_body_types_file = "unknown-body-types-mapping.json"

try:
    with open(input_file, "r") as file:
        data = json.load(file)
except FileNotFoundError:
    print(f"Error: File '{input_file}' not found.")
    exit(1)

# Filter out vehicles with "body_type": "Unknown"
filtered_data = []
unknown_body_types = {}

for vehicle in data["data"]:
    if vehicle.get("body_type") == "Unknown":
        # Add to unknown body types mapping
        model = vehicle.get("model", "Unknown Model")
        brand = vehicle.get("brand", "Unknown Brand")
        key = f"{brand} {model}"
        if key not in unknown_body_types:
            unknown_body_types[key] = "Unknown"
    else:
        # Keep vehicles with known body types
        filtered_data.append(vehicle)

# Save the filtered data (without "Unknown" body types)
try:
    with open(output_file, "w") as file:
        json.dump({"data": filtered_data}, file, indent=4)
    print(f"Filtered data saved to '{output_file}'.")
except Exception as e:
    print(f"Error saving filtered data: {e}")

# Save the unknown body types mapping
try:
    with open(unknown_body_types_file, "w") as file:
        json.dump(unknown_body_types, file, indent=4)
    print(f"Unknown body types mapping saved to '{unknown_body_types_file}'.")
except Exception as e:
    print(f"Error saving unknown body types mapping: {e}")

# Print summary
print("\nSummary:")
print(f"Total vehicles processed: {len(data['data'])}")
print(f"Vehicles with known body types: {len(filtered_data)}")
print(f"Vehicles with unknown body types: {len(unknown_body_types)}")
print("\nUnknown body types mapping:")
for key, value in unknown_body_types.items():
    print(f"- {key}: {value}")