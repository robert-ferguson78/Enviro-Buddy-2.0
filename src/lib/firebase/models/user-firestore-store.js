import { doc, getDoc, collection, updateDoc, query, where, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from '$lib/firebase/firebase.client';

const collectionName = "users";
// const userRef = collection(db, collectionName);

export const userFirestoreStore = {
    // Function to get a user by their ID
    getUser: async function(userId) {
        const userRef = doc(db, collectionName, userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            return null;
        }
    },

     // Function to get all users in the collection
    getAllUsers: async function() {
        const usersCollectionRef = collection(db, collectionName);
        const snapshot = await getDocs(usersCollectionRef);
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    },
    // Function to add details to a user document
    addUserDetails: async function(user) {
        console.log("addUserDetails called with user:", user);
        try {
            const userRef = doc(db, collectionName, user.user_id);
            await updateDoc(userRef, {
                name: user.name,
                brand: user.brand,
                type: user.type,
            });
            console.log("User details updated successfully");
            const docSnap = await getDoc(userRef);
            return { _id: docSnap.id, ...docSnap.data() };
        } catch (error) {
            console.error("Error in addUserDetails:", error);
            throw error;
        }
    },
    // Function to update a user document with new data
    updateUser: async function(_id, newData) {
        const userRef = doc(db, collectionName, _id);
        await updateDoc(userRef, newData);
        const updatedDoc = await getDoc(userRef);
        return updatedDoc.data();
    },

    // Function to update a user document with new data as an admin
    adminUpdateUser: async function(_id, newData) {
        const userRef = doc(db, collectionName, _id);
        await updateDoc(userRef, newData);
        const updatedDoc = await getDoc(userRef);
        return updatedDoc.data();
    },

    // Function to get a user by their ID
    getUserById: async function(_id) {
        const userRef = doc(db, collectionName, _id);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? docSnap.data() : null;
    },

    // Function to get a user by their email
    getUserByEmail: async function(email) {
        const usersCollectionRef = collection(db, collectionName);
        const q = query(usersCollectionRef, where("email", "==", email));
        const snapshot = await getDocs(q);
        return snapshot.empty ? null : { _id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },

    // Function to get all brand names in the collection
    getAllBrandNames: async function() {
        const usersCollectionRef = collection(db, collectionName);
        const q = query(usersCollectionRef, where("type", "==", "brand"));
        const snapshot = await getDocs(q);
        const brandNames = snapshot.docs.map(doc => doc.data().brandName);
        return brandNames;
    },

    // Function to delete a user by their ID
    deleteUserById: async function(id) {
        const userRef = doc(db, collectionName, id);
        await deleteDoc(userRef);
    },

     // Function to delete all users in the collection
    deleteAll: async function() {
        const usersCollectionRef = collection(db, collectionName);
        const snapshot = await getDocs(usersCollectionRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
};