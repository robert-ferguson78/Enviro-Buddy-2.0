import { setDoc, doc, collection, getFirestore } from 'firebase/firestore';
// import { db } from '$lib/firebase/firebase.client.ts'; // Adjusted import statement

const db = getFirestore();
const usersRef = collection(db, "users");

// Import the UUID library
import { v4 } from "uuid";

    // Method to get all users
    export async function getAllUsers() {
        // Get a snapshot of the 'users' collection
        const snapshot = await usersRef.get();
        // Map over the documents in the snapshot and return an array of users
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    }

    export async function addUserDetails(user) {
        // Get a reference to the document with the given uid
        const userRef = usersRef.doc(user.user_id);
        console.log("userRef: ", userRef);
        // Update the document with the new name and brand
        await userRef.update({
            name: user.name,
            brand: user.brand,
            type: user.type,
        });
        console.log("userRef2: ", userRef);
        // Get the updated document
        const doc = await userRef.get();
        console.log("doc: ", doc);
        // Return the updated user
        return { _id: doc.id, ...doc.data() };
    }

    // Method to add a user
    export async function addUser(user, userType) {
        // Generate a unique ID for the user if it doesn't have one
        const uniquId = user._id || v4();

        // Define the data to be stored in the database
        let data;
        if (userType === "brand") {
            // If the user is a brand, store the brand name
            data = {
                name: user.name,
                brandName: user.brandName,
                email: user.email,
                password: user.password,
                type: userType,
                _id: uniquId,
            };
        } else {
            // If the user is not a brand, store the first and last name
            data = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                type: userType,
                _id: uniquId,
            };
        }

        // Add the user to the 'users' collection with the unique ID as the document ID
        await usersRef.doc(uniquId).set(data)

        // Return the stored data
        return { ...data };
    }

    // Method to update a user
    export async function updateUser(_id, newData) {
        // console.log("update user fucntion _id:", _id);
        // Get a reference to the document with the given ID
        const userRef = usersRef.doc(_id);
            // console.log("userRef: ", userRef);

        // Update the document with the new data
        await userRef.update(newData);

        // Get the updated document
        const updatedDoc = await userRef.get();

        // Return the updated data
        return updatedDoc.data();
    }

    // Method to update a user
    export async function adminUpdateUser(_id, newData) {
        // Extract the user ID from the newData object
            // console.log("newdata: ", newData);
            // console.log("User ID to update:", _id);

        // Get a reference to the document with the given ID
        const userRef = usersRef.doc(_id);
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
        const users = await usersRef.where("_id", "==", _id).get();

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
        const snapshot = await usersRef.where("email", "==", email).get();

        // If the snapshot is empty, return null, otherwise return the first user in the snapshot
        return snapshot.empty ? null : { _id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }

    // Method to get all brand names
    export async function getAllBrandNames() {
        // Get a snapshot of the documents where 'type' is equal to 'brand'
        const snapshot = await usersRef.where("type", "==", "brand").get();

        // Map over the documents in the snapshot and return an array of brand names
        const brandNames = snapshot.docs.map(doc => doc.data().brandName);
        return brandNames;
    }

    // Method to delete a user by its ID
    export async function deleteUserById(id) {
        // Delete the document with the given ID from the 'users' collection
        await usersRef.doc(id).delete();
    }

    // Method to delete all users
    export async function deleteAll() {
        // Get a snapshot of the 'users' collection
        const snapshot = await usersRef.get();

        // Initialize a batch
        const batch = db.batch();

        // For each document in the snapshot, add a delete operation to the batch
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Commit the batch
        await batch.commit();
    }