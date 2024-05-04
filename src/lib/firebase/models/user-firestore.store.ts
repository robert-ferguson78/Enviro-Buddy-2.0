import { db } from '$lib/firebase/firebase.client';
import { getFirestore, doc, getDoc, collection, getDocs, setDoc, updateDoc } from "firebase/firestore";

const dbUser = getFirestore();

export async function getUser(userId: string) {
    const userRef = doc(dbUser, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data();
    } else {
        console.log("No such user!");
        return null;
    }
}

export async function getAllUsers() {
    const usersCollectionRef = collection(dbUser, "users");
    const snapshot = await getDocs(usersCollectionRef);
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
}

export async function addUserDetails(user) {
    console.log("user: ", user);
    const userRef = doc(dbUser, "users", user.user_id);
    console.log("userRef: ", userRef);
    // Update the document with the new name and brand
    await updateDoc(userRef, {
        name: user.name,
        brand: user.brand,
        type: user.type,
    });
    console.log("userRef2: ", userRef);
    // Get the updated document
    const docSnap = await getDoc(userRef);
    console.log("doc: ", docSnap);
    // Return the updated user
    return { _id: docSnap.id, ...docSnap.data() };
}

    // Method to update a user
    export async function updateUser(_id, newData) {
        // Get a reference to the document with the given ID
        const userRef = doc(dbUser, "users", _id);
    
        // Update the document with the new data
        await updateDoc(userRef, newData);
    
        // Get the updated document
        const updatedDoc = await getDoc(userRef);
    
        // Return the updated data
        return updatedDoc.data();
    }

    // Method to update a user
    export async function adminUpdateUser(_id, newData) {
        // Extract the user ID from the newData object
            // console.log("newdata: ", newData);
            // console.log("User ID to update:", _id);

        // Get a reference to the document with the given ID
        const userRef = userRef.doc(_id);
            // console.log("userRef: ", userRef);

        // Update the document with the new data
        await userRef.update(newData);

        // Get the updated document
        const updatedDoc = await userRef.get();

        // Return the updated data
        return updatedDoc.data();
    }

    // Method to get a user by its ID
    export async function getUserById(_id) {
        // Get a snapshot of the documents where '_id' is equal to the given ID
        const users = await userRef.where("_id", "==", _id).get();

        // If the snapshot is empty, return null
        if (users.empty) {
            return null;
        }

        // If there is more than one user with the given ID, throw an error
        if (users.size > 1) {
            throw new Error(`Multiple users found with _id: ${_id}`);
        }

        // Return the data of the first user in the snapshot
        return users.docs[0].data();
    }

    // Method to get a user by its email
    export async function getUserByEmail(email) {
        // Get a snapshot of the documents where 'email' is equal to the given email
        const snapshot = await userRef.where("email", "==", email).get();

        // If the snapshot is empty, return null, otherwise return the first user in the snapshot
        return snapshot.empty ? null : { _id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }

    // Method to get all brand names
    export async function getAllBrandNames() {
        // Get a snapshot of the documents where 'type' is equal to 'brand'
        const snapshot = await userRef.where("type", "==", "brand").get();

        // Map over the documents in the snapshot and return an array of brand names
        const brandNames = snapshot.docs.map(doc => doc.data().brandName);
        return brandNames;
    }

    // Method to delete a user by its ID
    export async function deleteUserById(id) {
        // Delete the document with the given ID from the 'users' collection
        await userRef.doc(id).delete();
    }

    // Method to delete all users
    export async function deleteAll() {
        // Get a snapshot of the 'users' collection
        const snapshot = await userRef.get();

        // Initialize a batch
        const batch = db.batch();

        // For each document in the snapshot, add a delete operation to the batch
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Commit the batch
        await batch.commit();
    }