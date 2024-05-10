import { doc, getDoc, collection, updateDoc, query, where, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from '$lib/firebase/firebase.client';

const collectionName = "users";
const usersRef = collection(db, collectionName);

export const userFirestoreStore = {
    getUser: async function(userId: string) {
        const userRef = doc(db, collectionName, userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            return null;
        }
    },

    getAllUsers: async function() {
        const usersCollectionRef = collection(db, collectionName);
        const snapshot = await getDocs(usersCollectionRef);
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    },

    addUserDetails: async function(user) {
        const userRef = doc(db, collectionName, user.user_id);
        await updateDoc(userRef, {
            name: user.name,
            brand: user.brand,
            type: user.type,
        });
        const docSnap = await getDoc(userRef);
        return { _id: docSnap.id, ...docSnap.data() };
    },

    updateUser: async function(_id, newData) {
        const userRef = doc(db, collectionName, _id);
        await updateDoc(userRef, newData);
        const updatedDoc = await getDoc(userRef);
        return updatedDoc.data();
    },

    adminUpdateUser: async function(_id, newData) {
        const userRef = doc(db, collectionName, _id);
        await updateDoc(userRef, newData);
        const updatedDoc = await getDoc(userRef);
        return updatedDoc.data();
    },

    getUserById: async function(_id) {
        const userRef = doc(db, collectionName, _id);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? docSnap.data() : null;
    },

    getUserByEmail: async function(email) {
        const usersCollectionRef = collection(db, collectionName);
        const q = query(usersCollectionRef, where("email", "==", email));
        const snapshot = await getDocs(q);
        return snapshot.empty ? null : { _id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },

    getAllBrandNames: async function() {
        const usersCollectionRef = collection(db, collectionName);
        const q = query(usersCollectionRef, where("type", "==", "brand"));
        const snapshot = await getDocs(q);
        const brandNames = snapshot.docs.map(doc => doc.data().brandName);
        return brandNames;
    },

    deleteUserById: async function(id) {
        const userRef = doc(db, collectionName, id);
        await deleteDoc(userRef);
    },

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