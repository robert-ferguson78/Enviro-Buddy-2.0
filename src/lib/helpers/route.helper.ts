import { goto } from '$app/navigation';
import { sendJWTToken } from '$lib/firebase/auth.client';
import { setUser } from '$lib/firebase/database.client';

export async function afterLogin(url: URL) {
    const route = url.searchParams.get('redirect') || '/';
    console.log('afterLogin: route:', route);
    await sendJWTToken();
    console.log('afterLogin: sendJWTToken called');
    await goto(route);
    console.log('afterLogin: goto called with route:', route);
}

export async function afterLoginGoogle(url: URL, userId: string, userName: string) {
    console.log('afterLoginGoogle: called with url:', url, 'userId:', userId, 'userName:', userName);
    
    const route = url.searchParams.get('redirect') || '/';
    console.log('afterLoginGoogle: route:', route);
    
    if (userId) {
        try {
            console.log('afterLoginGoogle: calling setUser with userId:', userId, 'userName:', userName);
            await setUser(userId, userName); // Pass userId as a parameter, not as a property of an object
            console.log('afterLoginGoogle: setUser completed');
        } catch (error) {
            console.error('afterLoginGoogle: error calling setUser:', error);
        }
    } else {
        console.error('afterLoginGoogle: userId is empty');
    }
    
    console.log('afterLoginGoogle: calling sendJWTToken');
    await sendJWTToken();
    console.log('afterLoginGoogle: sendJWTToken completed');
    
    console.log('afterLoginGoogle: calling goto with route:', route);
    await goto(route);
    console.log('afterLoginGoogle: goto completed');
}