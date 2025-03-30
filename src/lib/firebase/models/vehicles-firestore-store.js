import { collection, doc, getDoc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from '$lib/firebase/firebase.client'; // Changed to firebase.client

const collectionName = "vehicles";

export const vehiclesFirestoreStore = {
    // Get all vehicles
    getAllVehicles: async function() {
        try {
            const vehiclesRef = collection(db, collectionName);
            const snapshot = await getDocs(vehiclesRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting vehicles:', error);
            throw error;
        }
    },

    // Get a vehicle by ID
    getVehicleById: async function(id) {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting vehicle by ID:', error);
            throw error;
        }
    },

    // Import vehicles from JSON data
    importVehicles: async function(vehiclesData) {
        try {
            const batch = writeBatch(db);
            let count = 0;
            for (const vehicle of vehiclesData) {
                const vehicleRef = doc(db, collectionName, vehicle.id);
                batch.set(vehicleRef, vehicle);
                count++;
            }
            await batch.commit();
            return { success: true, count };
        } catch (error) {
            console.error('Error importing vehicles:', error);
            throw error;
        }
    },

    // Get vehicles by brand name
    getVehiclesByBrand: async function(brandName) {
        try {
            console.log('Searching for vehicles with brand name:', brandName);
            
            // Create a reference to the vehicles collection
            const vehiclesRef = collection(db, collectionName);
            
            // Create a query against the collection to filter by brand
            const q = query(vehiclesRef, where("brand", "==", brandName));
            
            // Execute the query
            const snapshot = await getDocs(q);
            
            console.log(`Found ${snapshot.size} vehicles matching brand: "${brandName}"`);
            
            // Map the query results to an array of vehicle objects
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting vehicles by brand:', error);
            return [];
        }
    }
};