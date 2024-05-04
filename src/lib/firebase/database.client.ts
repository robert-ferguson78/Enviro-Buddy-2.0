import { setDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase.client.js';
import type { User } from '$lib/types/enviro-buddy-types';

export async function setUser(userId: string, name: string) {
    // console.log(typeof userId); // Log the type of userId
    if (!userId || typeof userId !== 'string') {
        // console.log(userId,'this is used id value');
        throw new Error('userId is required');
    }
    const users = collection(db, 'users');
    const userDoc = doc(users, userId);
    const docSnap = await getDoc(userDoc);

    if (!docSnap.exists()) {
        // The document does not exist, create a new one with default values
        await setDoc(userDoc, {
            user_id: userId,
            brand: 'none',
            type: 'client',
            name: name // Use the name parameter
        });
    }
}

export async function setUserWithEmail(user: User) {
    const userId = user.user_id;
    // console.log(typeof userId); // Log the type of userId

    if (!userId || typeof userId !== 'string') {
        // console.log(userId,'this is used id value');
        throw new Error('userId is required');
    }

    const users = collection(db, 'users');
    const userDoc = doc(users, userId);
    const docSnap = await getDoc(userDoc);

    // console.log(docSnap); // Log the docSnap object

    if (!docSnap.exists()) {
        // The document does not exist, create a new one with the user object
        await setDoc(userDoc, user);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
    }
}