import { setDoc, collection, doc } from 'firebase/firestore';
import { db } from './firebase.client.js';
import type { User } from '$lib/types/enviro-buddy-types';

export async function setUser(user: User) {
    const users = collection(db, 'users');
    await setDoc(doc(users, user.user_id), user);
}

export async function setUserGoogle(userId: string) {
    const users = collection(db, 'users');
    await setDoc(doc(users, userId), {
        user_id: userId
    })
}
