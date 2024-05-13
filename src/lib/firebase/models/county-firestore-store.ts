import { doc, getDoc, collection, updateDoc, query, where, getDocs, deleteDoc, addDoc } from "firebase/firestore";
import { db } from '$lib/firebase/firebase.client';

const collectionName = "counties";
const countiesRef = collection(db, collectionName);

// Import the dealer Firestore store
// import { dealerFirestoreStore } from "$lib/firebase/models/dealer-firestore-store.js";

// Define the Firestore store for counties
export const countyFirestoreStore = {
    // Method to get all counties
    async getAllCounties() {
        // Get a snapshot of the 'counties' collection
        const snapshot = await getDocs(countiesRef);
        // Map over the documents in the snapshot and return an array of counties
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    },

    // Method to add a county
    async addCounty(county, userId) {
        // Prepare the data to be added
        const data = {
            ...county,
            userId: userId
        };
    
        let docRef;
        // Try to add the data to the 'counties' collection
        try {
            docRef = await addDoc(countiesRef, data);
        } catch (error) {
            // Log any errors that occur
            console.error("Error writing document: ", error);
        }
    
        // Get the auto-generated ID
        const id = docRef.id;
    
        // Update the document to include the _id field
        try {
            await updateDoc(doc(countiesRef, id), {
                _id: id
            });
        } catch (error) {
            // Log any errors that occur
            console.error("Error updating document: ", error);
        }
    
        // Return the added data with the _id field
        return { _id: id, ...data };
    },

    // Method to get a county by its ID
    // async getCountyById(id) {
    //     // Check if the ID is a non-empty string
    //     if (typeof id !== "string" || id.trim() === "") {
    //         // Log an error message and return null if the ID is invalid
    //         console.error(`Invalid id: ${id}`);
    //         return null;
    //     }
    //     // Get the document with the given ID
    //     const docRef = doc(db, collectionName, id);
    //     const docSnap = await getDoc(docRef);
    //     // If the document exists, return the county, otherwise return null
    //     const county = docSnap.exists() ? { _id: docSnap.id, ...docSnap.data() } : null;
    //     // If the county exists, get its dealers
    //     if (county) {
    //         county.dealers = await dealerFirestoreStore.getDealersByCountyId(county._id);
    //     }
    //     // Return the county
    //     return county;
    // },

    // Method to check for a county
    async getCheckForCounty(county, userId) {
        console.log(`Checking for county: ${county} for user: ${userId}`); // Log the inputs
    
        let countyExists = false;
    
        try {
            const querySnapshot = await getDocs(query(countiesRef, where("county", "==", county), where("userId", "==", userId)));
            querySnapshot.forEach((doc) => {
                console.log(doc.data()); // Log the data of each matching document
                countyExists = true;
            });
        } catch (error) {
            console.error("Error checking for county: ", error); // Log any errors that occur
        }
    
        console.log(`County exists: ${countyExists}`); // Log the output
    
        return countyExists;
    },
    
    // Method to get counties by user ID
    async getCountiesByUserId(userId) {
        try {
          const snapshot = await getDocs(query(countiesRef, where('userId', '==', userId)));
          if (snapshot.empty) {
            console.log('No matching documents.');
            // console.log('Returning: []');
            return [];
          }  
          const data = snapshot.docs.map(doc => doc.data());
          // console.log('Returning:', data);
          return data;
        } catch (error) {
          console.error('Error getting counties:', error);
          // console.log('Returning: []');
          return [];
        }
      },

    // Method to get all unique counties
    async getAllUniqueCounties() {
        // Get a snapshot of the 'counties' collection
        const snapshot = await getDocs(countiesRef);
        // Map over the documents in the snapshot to get an array of counties
        const counties = snapshot.docs.map(doc => doc.data());
        // Filter the array to remove duplicates and sort it alphabetically
        const uniqueCounties = counties
            .filter((county, index, self) =>
                index === self.findIndex((c) => c.county === county.county)
            )
            .sort((a, b) => a.county.localeCompare(b.county));
        // Return the array of unique counties
        return uniqueCounties;
    },
    
    // Method to find a county
    async findCounty({ userid, county }) {
        // Get a snapshot of the documents where 'userid' and 'county' match the given values
        const q = query(countiesRef, where("userid", "==", userid), where("county", "==", county));
        const snapshot = await getDocs(q);
        // If the snapshot is empty, return null, otherwise return the first matching county
        return snapshot.empty ? null : { _id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },
    
    // Method to get user counties
    async getUserCounties(userid) {
        // Get a snapshot of the documents where 'userid' is equal to the given user ID
        const q = query(countiesRef, where("userid", "==", userid));
        const snapshot = await getDocs(q);
        // If the snapshot is empty, log a message and return an empty array
        if (snapshot.empty) {
            console.log("No matching documents.");
            return [];
        }
        // Map over the documents in the snapshot and return an array of counties
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    },

    // Method to get user ID by county ID
    async getUserIdByCountyId(countyId) {
        // Get the document with the given county ID
        const docRef = doc(countiesRef, countyId);
        const docSnap = await getDoc(docRef);
        // If the document exists, return the user ID, otherwise return null
        return docSnap.exists() ? docSnap.data().userid : null;
    },
    
    // Method to delete a county by its ID
    async deleteCountyById(_id) {
        // Create a reference to the document with the given _id
        const docRef = doc(db, collectionName, _id);
        // Delete the document
        await deleteDoc(docRef);
    },
    
    // // Method to delete all counties
    // async deleteAllCounties() {
    //     // Get a snapshot of the 'counties' collection
    //     const snapshot = await getDocs(countiesRef);
    //     // For each document in the snapshot, delete the document
    //     snapshot.docs.forEach(async (doc) => {
    //         const docRef = doc(countiesRef, doc.id);
    //         await deleteDoc(docRef);
    //     });
    // },
};