import { goto } from '$app/navigation';
import { sendJWTToken } from '$lib/firebase/auth.client.js';
import { setUser } from '$lib/firebase/database.client.js';

export async function afterLogin(url, userId) {
    const route = url.searchParams.get('redirect') || '/';
    await setUser(userId);
    await sendJWTToken();
    await goto(route);
}