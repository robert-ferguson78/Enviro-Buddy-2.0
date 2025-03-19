import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '$lib/firebase/firebase.server';

class VehiclesFirestoreStore {
    constructor() {
        this.collection = 'vehicles';
    }

    // Get all vehicles
    async getAllVehicles() {
        try {
            const vehiclesRef = collection(db, this.collection);
            const snapshot = await getDocs(vehiclesRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting vehicles:', error);
            throw error;
        }
    }

    // Get a vehicle by ID
    async getVehicleById(id) {
        try {
            const docRef = doc(db, this.collection, id);
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
    }

    // Import vehicles from JSON data
    async importVehicles(vehiclesData) {
        try {
            const batch = writeBatch(db);
            let count = 0;

            for (const vehicle of vehiclesData) {
                const vehicleRef = doc(db, this.collection, vehicle.id);
                batch.set(vehicleRef, vehicle);
                count++;
            }

            await batch.commit();
            return { success: true, count };
        } catch (error) {
            console.error('Error importing vehicles:', error);
            throw error;
        }
    }
}

export const vehiclesFirestoreStore = new VehiclesFirestoreStore();