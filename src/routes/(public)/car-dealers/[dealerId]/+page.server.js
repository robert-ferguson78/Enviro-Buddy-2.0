import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';
import { vehiclesFirestoreStore } from '$lib/firebase/models/vehicles-firestore-store'; 

export const load = async ( { params } ) => {
    try {
        // Extract the dealerId from the route parameters
        const dealersId = params.dealerId;
        // console.log('Dealer ID:', dealersId);
        const dealer = await dealerFirestoreStore.getDealerById(dealersId);

        // Fetch related data together for better performance
        const [userData, countyData] = await Promise.all([
            // Fetch user data to get brand information
            userFirestoreStore.getUser(dealer.userId),
            // Fetch county data to get county name
            countyFirestoreStore.getCountyById(dealer.countyId)
        ]);

        // Add extra data to dealer
        const dealerWithExtraInfo = {
            ...dealer,
            brand: userData.brand,
            county: countyData.county
        };

        // Fetch vehicles that match the dealer's brand
        const matchingVehicles = await vehiclesFirestoreStore.getVehiclesByBrand(userData.brand);
        console.log(`Found ${matchingVehicles.length} vehicles for brand: ${userData.brand}`);

        // Process vehicles to make them serializable
        const serializableVehicles = matchingVehicles.map(vehicle => {
            // Create a new object with all properties from the vehicle
            const processedVehicle = { ...vehicle };
            
            // Check if importedAt exists and is a Firestore Timestamp
            if (processedVehicle.importedAt && typeof processedVehicle.importedAt.toDate === 'function') {
                // Convert Firestore Timestamp to ISO string
                processedVehicle.importedAt = processedVehicle.importedAt.toDate().toISOString();
            } else if (processedVehicle.importedAt) {
                // If it's not a Firestore Timestamp but still not serializable, remove it
                delete processedVehicle.importedAt;
            }
            
            // Check for other potential Timestamp fields
            const timestampFields = ['createdAt', 'updatedAt', 'timestamp', 'date'];
            
            timestampFields.forEach(field => {
                if (processedVehicle[field] && typeof processedVehicle[field].toDate === 'function') {
                    processedVehicle[field] = processedVehicle[field].toDate().toISOString();
                }
            });
            
            // Return the processed vehicle
            return processedVehicle;
        });

        // added the matching vehicles to props
        // Return data in a structured format for the page component
        // The 'props' property will be accessible via $props() in Svelte 5
        return { 
            props: { 
            dealer: dealerWithExtraInfo,
            vehicles: serializableVehicles
            } 
        };
    } catch (error) {
        console.error('Error in load function:', error.message);
        return { status: 500, error: error.message };
    }
}