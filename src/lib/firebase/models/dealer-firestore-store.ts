import { doc, getDoc, collection, updateDoc, query, where, getDocs, deleteDoc, addDoc } from "firebase/firestore";
import { db } from '$lib/firebase/firebase.client';

const collectionName = "dealers";
const dealersRef = collection(db, collectionName);

export const dealerFirestoreStore = {
    async getAllDealers() {
        const q = query(dealersRef);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    },

    async addDealer(countyId, dealer) {
        dealer.countyId = countyId;
        const docRef = await addDoc(dealersRef, dealer);
        const dealerId = docRef.id;
        await updateDoc(docRef, { dealerId: dealerId });
        return { _id: dealerId, dealerId: dealerId, ...dealer };
    },

    async addImageToDealer(id, imageUrl) {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error("Dealer not found");
        }
        const dealer = docSnap.data();
        if (!dealer.images) {
            dealer.images = [];
        }
        dealer.images.push(imageUrl);
        await updateDoc(docRef, dealer);
    },

    async getDealersByCountyId(id) {
        const q = query(dealersRef, where("countyId", "==", id));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    },

    async getDealerById(id) {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { _id: docSnap.id, ...docSnap.data() } : null;
    },

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

    async updateDealer(id, updatedDealer) {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updatedDealer);
    },
};