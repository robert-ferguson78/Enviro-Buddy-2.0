import { db } from '$lib/firebase/firebase.server.js';

export async function load() {
    const count = await db.collection('users').count().get();
    return {
        count: count.data().count
    }
}