import { doc, getDoc, collection, updateDoc, query, where, getDocs, deleteDoc, addDoc } from "firebase/firestore";
import { db } from '$lib/firebase/firebase.client';

const collectionName = "dealers";
const dealersRef = collection(db, collectionName);

export const dealerFirestoreStore = {
    // Function to get the count of unread notifications for a specific user
    async getAllDealers() {
        const q = query(dealersRef);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    },

    // Function to add a new dealer to the Firestore database
    async addDealer(countyId, dealer) {
        dealer.countyId = countyId;
        const docRef = await addDoc(dealersRef, dealer);
        const dealerId = docRef.id;
        await updateDoc(docRef, { dealerId: dealerId });
        return { _id: dealerId, dealerId: dealerId, ...dealer };
    },

    // Function to add an image to a dealer in the Firestore database
    async addImageToDealer(id, imageUrl) {
        // Create a reference to the document with the specified ID in the Firestore database
        const docRef = doc(db, collectionName, id);

        // Get the document snapshot for the document reference
        const docSnap = await getDoc(docRef);

        // If the document does not exist, throw an error
        if (!docSnap.exists()) {
            throw new Error("Dealer not found");
        }

        // Get the data from the document snapshot
        const dealer = docSnap.data();

        // If the dealer does not have an 'images' property, initialize it as an empty array
        if (!dealer.images) {
            dealer.images = [];
        }

        // Add the image URL to the 'images' array
        dealer.images.push(imageUrl);

        // Update the document with the new dealer data
        await updateDoc(docRef, dealer);
    },

    // Function to get dealers by county ID from the Firestore database
    async getDealersByCountyId(id) {
        const q = query(dealersRef, where("countyId", "==", id));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    },

    // Function to get a dealer by their ID from the Firestore database
    async getDealerById(id) {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { _id: docSnap.id, ...docSnap.data() } : null;
    },

    // Function to delete a dealer by their ID from the Firestore database
    async deleteDealer(id) {
        const q = query(dealersRef, where("dealerId", "==", id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docRef = doc(db, collectionName, querySnapshot.docs[0].id);
            await deleteDoc(docRef);
        } else {
            console.log(`No dealer found with dealerId: ${id}`);
        }
    },

    // async deleteAllDealers() {
    //     const querySnapshot = await getDocs(dealersRef);
    //     const batch = writeBatch(db);
    //     querySnapshot.docs.forEach((doc) => {
    //         const docRef = doc(db, collectionName, doc.id);
    //         batch.delete(docRef);
    //     });
    //     await batch.commit();
    // },

    // Function to update a dealer by their ID in the Firestore database
    async updateDealer(id, updatedDealer) {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updatedDealer);
    },
};