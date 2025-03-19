import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase/firebase.server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Import API key from environment variables
const API_KEY = import.meta.env.VITE_IMPORT_API_KEY;

export async function POST({ request, locals }) {
    try {
        // Log information about the request and locals
        console.log("Request received for import-vehicles");
        console.log("Locals user:", locals.user ? JSON.stringify(locals.user) : "No user in locals");
        
        // Check API key from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        if (token !== API_KEY) {
            return json({ error: 'Invalid API key' }, { status: 403 });
        }
        
        // Parse request body to get user ID
        const requestData = await request.json();
        console.log("Request body:", requestData);
        
        // Get user ID from request body or locals
        let userId = null;
        
        if (locals.user && locals.user.uid) {
            userId = locals.user.uid;
            console.log("Using user ID from locals:", userId);
        } else if (requestData && requestData.userId) {
            userId = requestData.userId;
            console.log("Using user ID from request body:", userId);
        }
        
        if (!userId) {
            console.log("No valid user ID found");
            return json({ error: 'Invalid user ID' }, { status: 400 });
        }
        
        // Get user data to check if admin
        console.log("Fetching user data for ID:", userId);
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.log("User document not found");
            return json({ error: 'User not found' }, { status: 404 });
        }
        
        const userData = userDoc.data();
        console.log("User data:", userData);
        
        if (userData.type !== 'admin') {
            console.log("User is not an admin. Type:", userData.type);
            return json({ error: 'Admin privileges required' }, { status: 403 });
        }
        
        // Read the JSON file with vehicle data from the correct location
        const filePath = join(process.cwd(), 'src', 'lib', 'dataSets', 'db-ev-data.json');
        console.log("Reading file from:", filePath);
        
        let fileData;
        try {
            fileData = readFileSync(filePath, 'utf8');
            console.log("File read successfully, length:", fileData.length);
            // Log a preview of the file content
            console.log("File content preview:", fileData.substring(0, 200) + "...");
        } catch (fileError) {
            console.error("Error reading file:", fileError);
            return json({ error: `Error reading vehicle data file: ${fileError.message}` }, { status: 500 });
        }
        
        let vehiclesData;
        try {
            vehiclesData = JSON.parse(fileData);
            console.log("Parsed JSON data type:", typeof vehiclesData);
            console.log("Parsed JSON data structure:", Object.keys(vehiclesData));
            
            // Determine where the vehicles array is in the data structure
            let vehicles;
            if (Array.isArray(vehiclesData)) {
                vehicles = vehiclesData;
                console.log("Data is an array with", vehicles.length, "items");
            } else if (vehiclesData.vehicles && Array.isArray(vehiclesData.vehicles)) {
                vehicles = vehiclesData.vehicles;
                console.log("Found vehicles array with", vehicles.length, "items");
            } else if (vehiclesData.data && Array.isArray(vehiclesData.data)) {
                vehicles = vehiclesData.data;
                console.log("Found data array with", vehicles.length, "items");
            } else {
                // Try to find an array property
                const arrayProps = Object.keys(vehiclesData).filter(key => 
                    Array.isArray(vehiclesData[key]) && vehiclesData[key].length > 0
                );
                
                if (arrayProps.length > 0) {
                    vehicles = vehiclesData[arrayProps[0]];
                    console.log(`Found array in property "${arrayProps[0]}" with ${vehicles.length} items`);
                } else {
                    // If no array found, try to convert object to array
                    vehicles = Object.values(vehiclesData);
                    console.log("Converted object to array with", vehicles.length, "items");
                }
            }
            
            // Validate that we have an array of vehicles
            if (!Array.isArray(vehicles)) {
                throw new Error(`Could not find a valid array of vehicles in the data. Data type: ${typeof vehicles}`);
            }
            
            // Log sample of the first vehicle
            if (vehicles.length > 0) {
                console.log("Sample vehicle:", JSON.stringify(vehicles[0]).substring(0, 200) + "...");
            } else {
                console.log("No vehicles found in the data");
                return json({ error: 'No vehicles found in the data file' }, { status: 400 });
            }
            
            // Import vehicles to Firestore
            let batch = db.batch();
            let count = 0;
            
            for (const vehicle of vehicles) {
                // Ensure we have a valid document ID
                let docId;
                if (vehicle.id && typeof vehicle.id === 'string' && vehicle.id.trim() !== '') {
                    docId = vehicle.id.trim();
                } else {
                    // Generate a new ID if none exists or is invalid
                    docId = db.collection('vehicles').doc().id;
                }
                
                if (count < 5) {
                    console.log(`Processing vehicle with ID: ${docId}`);
                } else if (count === 5) {
                    console.log("Processing remaining vehicles...");
                }
                
                const vehicleRef = db.collection('vehicles').doc(docId);
                
                // Add timestamp for when the vehicle was imported
                const vehicleData = {
                    ...vehicle,
                    importedAt: new Date(),
                    updatedAt: new Date()
                };
                
                // If the original ID was invalid, add the new one to the data
                if (docId !== vehicle.id) {
                    vehicleData.id = docId;
                }
                
                batch.set(vehicleRef, vehicleData, { merge: true });
                count++;
                
                // Firestore batches are limited to 500 operations
                if (count % 500 === 0) {
                    console.log(`Committing batch of 500 vehicles (${count} total so far)`);
                    await batch.commit();
                    batch = db.batch();
                }
            }
            
            // Commit any remaining operations
            if (count % 500 !== 0) {
                console.log(`Committing final batch of ${count % 500} vehicles`);
                await batch.commit();
            }
            
            console.log(`Import completed successfully. Total vehicles: ${count}`);
            return json({
                message: 'Vehicles imported successfully',
                count
            });
            
        } catch (parseError) {
            console.error("Error processing JSON:", parseError);
            return json({ error: parseError.message }, { status: 500 });
        }
    } catch (error) {
        console.error('Import error:', error);
        return json({ 
            error: error.message || 'An error occurred during import' 
        }, { status: 500 });
    }
}