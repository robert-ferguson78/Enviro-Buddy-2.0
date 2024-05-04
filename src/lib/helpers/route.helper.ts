import { goto } from '$app/navigation';
import { sendJWTToken } from '$lib/firebase/auth.client';
import { setUser } from '$lib/firebase/database.client';

export async function afterLogin(url: URL) {
    const route = url.searchParams.get('redirect') || '/';
    // await setUser(userId);
    await sendJWTToken();
    await goto(route);
}

export async function afterLoginGoogle(url: URL, userId: string, userName: string) {
    // console.log('afterLoginGoogle called with url:', url, 'and userId:', userId);
    
    // Create a user object with a user_id field
    const user = { user_id: userId };

    const route = url.searchParams.get('redirect') || '/';
    // console.log('Redirect route:', route);
    
    // console.log('Calling setUser...');
    if (userId) {
        try {
            await setUser(user, userName); // Pass the userName parameter to setUser
            // console.log('setUser completed');
        } catch (error) {
            console.error('Error calling setUser:', error);
        }
    } else {
        console.error('userId is empty');
    }
    // console.log('setUser completed');
    
    // console.log('Calling sendJWTToken...');
    await sendJWTToken();
    // console.log('sendJWTToken completed');
    
    // console.log('Calling goto...');
    await goto(route);
    // console.log('goto completed');
}