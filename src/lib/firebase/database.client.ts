import { setDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase.client.js';
import type { User } from '$lib/types/enviro-buddy-types';

/**
 * Asynchronously set a user in the Firestore database.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} name - The name of the user.
 * @throws {Error} - Throws an error if the userId is not provided or is not a string.
 */
export async function setUser(userId: string, name: string) {
    // console.log(typeof userId); // Log the type of userId
    // Check if the userId is provided and is a string
    if (!userId || typeof userId !== 'string') {
        // console.log(userId,'this is used id value');
        throw new Error('userId is required');
    }

    // Get a reference to the 'users' collection and the document with the specified userId
    const users = collection(db, 'users');
    const userDoc = doc(users, userId);
    const docSnap = await getDoc(userDoc);

    // If the document does not exist, create a new one with default values
    if (!docSnap.exists()) {
        await setDoc(userDoc, {
            user_id: userId,
            brand: 'none',
            type: 'client',
            name: name // Use the name parameter
        });
    }
}

/**
 * Asynchronously set a user in the Firestore database using an email.
 *
 * @param {User} user - The user object.
 * @throws {Error} - Throws an error if the userId is not provided or is not a string.
 */
export async function setUserWithEmail(user: User) {
    const userId = user.user_id;
    // console.log(typeof userId); // Log the type of userId

    // Check if the userId is provided and is a string
    if (!userId || typeof userId !== 'string') {
        // console.log(userId,'this is used id value');
        throw new Error('userId is required');
    }

    // Get a reference to the 'users' collection and the document with the specified userId
    const users = collection(db, 'users');
    const userDoc = doc(users, userId);
    const docSnap = await getDoc(userDoc);

    // console.log(docSnap); // Log the docSnap object

    // If the document does not exist, create a new one with the user object
    if (!docSnap.exists()) {
        await setDoc(userDoc, user);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
    }
}