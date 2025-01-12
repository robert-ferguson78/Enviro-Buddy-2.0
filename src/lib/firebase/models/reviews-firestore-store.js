import { getDoc, doc, collection, addDoc, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '$lib/firebase/firebase.client.js';

const collectionName = "reviews";

export const reviewsFirestoreStore = {
    // Function to get real-time updates of reviews for a specific dealer
    getReviewsRealtime: function(dealerId, callback) {
        // Create a query to get the 'messages' collection within the document with the specified dealer ID
        const q = query(collection(doc(db, collectionName, dealerId), 'messages'));
    
        // Set up a real-time listener for the query
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Map each document in the snapshot to a review object
            const reviews = snapshot.docs.map((doc) => {
                // Get the document's data
                const data = doc.data();
                if (data) {
                    // If the document has data, return a review object with the document's ID and data
                    return {
                        id: doc.id,
                        userId: data.userId,
                        userName: data.userName,
                        message: data.message,
                        timestamp: data.timestamp,
                    };
                }
            });
    
            // Call the callback function with the array of review objects
            callback(reviews);
        }, (error) => {
            // If there's an error setting up the real-time listener, log the error
            console.error(`Error setting up real-time listener:`, error);
        });
    
        // Return the unsubscribe function for the real-time listener
        return unsubscribe;
    },

    // Function to create a new review for a specific dealer
    createReview: async function(dealerId, userId, userName, message) {
        const reviewData = {
            userId: userId,
            userName: userName,
            message: message,
            timestamp: serverTimestamp(),
        };
        
        const reviewRef = await addDoc(collection(doc(db, collectionName, dealerId), 'messages'), reviewData);
        return reviewRef.id;
    },

    // Function to check if a dealer exists in the collection
    checkForDealer: async function(dealerId) {
        const dealerDoc = await getDoc(doc(db, collectionName, dealerId));
        return dealerDoc.exists;
    }
};