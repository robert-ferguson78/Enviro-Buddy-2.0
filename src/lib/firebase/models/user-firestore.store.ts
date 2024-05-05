import { getFirestore, doc, getDoc, collection, updateDoc, query, where, getDocs, deleteDoc, writeBatch } from "firebase/firestore";

const dbUser = getFirestore();

const collectionName = "users";

export async function getUser(userId: string) {
    const userRef = doc(dbUser, collectionName, userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data();
    } else {
        return null;
    }
}

export async function getAllUsers() {
    const usersCollectionRef = collection(dbUser, collectionName);
    const snapshot = await getDocs(usersCollectionRef);
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
}

export async function addUserDetails(user) {
    const userRef = doc(dbUser, collectionName, user.user_id);
    await updateDoc(userRef, {
        name: user.name,
        brand: user.brand,
        type: user.type,
    });
    const docSnap = await getDoc(userRef);
    return { _id: docSnap.id, ...docSnap.data() };
}

export async function updateUser(_id, newData) {
    const userRef = doc(dbUser, collectionName, _id);
    await updateDoc(userRef, newData);
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.data();
}

export async function adminUpdateUser(_id, newData) {
    const userRef = doc(dbUser, collectionName, _id);
    await updateDoc(userRef, newData);
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.data();
}

export async function getUserById(_id) {
    const userRef = doc(dbUser, collectionName, _id);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data() : null;
}

export async function getUserByEmail(email) {
    const usersCollectionRef = collection(dbUser, collectionName);
    const q = query(usersCollectionRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { _id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function getAllBrandNames() {
    const usersCollectionRef = collection(dbUser, collectionName);
    const q = query(usersCollectionRef, where("type", "==", "brand"));
    const snapshot = await getDocs(q);
    const brandNames = snapshot.docs.map(doc => doc.data().brandName);
    return brandNames;
}

export async function deleteUserById(id) {
    const userRef = doc(dbUser, collectionName, id);
    await deleteDoc(userRef);
}

export async function deleteAll() {
    const usersCollectionRef = collection(dbUser, collectionName);
    const snapshot = await getDocs(usersCollectionRef);
    const batch = writeBatch(dbUser);
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}