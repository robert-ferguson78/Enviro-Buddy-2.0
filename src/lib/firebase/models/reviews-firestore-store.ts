import { getDoc, doc, collection, addDoc, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '$lib/firebase/firebase.client';

const collectionName = "reviews";

export const reviewsFirestoreStore = {
    getReviewsRealtime: function(dealerId: string, callback: (reviews: Review[]) => void) {
        const q = query(collection(doc(db, collectionName, dealerId), 'messages'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviews = snapshot.docs.map((doc) => {
                const data = doc.data();
                if (data) {
                    return {
                        id: doc.id,
                        userId: data.userId,
                        userName: data.userName,
                        message: data.message,
                        timestamp: data.timestamp,
                    };
                }
            });
            callback(reviews);
        }, (error) => {
            console.error(`Error setting up real-time listener:`, error);
        });
        return unsubscribe;
    },
    
    createReview: async function(dealerId: string, userId: string, userName: string, message: string) {
        const reviewData = {
            userId: userId,
            userName: userName,
            message: message,
            timestamp: serverTimestamp(),
        };
    
        const reviewRef = await addDoc(collection(doc(db, collectionName, dealerId), 'messages'), reviewData);
        return reviewRef.id;
    },

    checkForDealer: async function(dealerId: string) {
        const dealerDoc = await getDoc(doc(db, collectionName, dealerId));
        return dealerDoc.exists;
    }
};