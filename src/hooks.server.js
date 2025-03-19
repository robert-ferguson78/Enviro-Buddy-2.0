import { auth } from '$lib/firebase/firebase.server';
import { redirect } from '@sveltejs/kit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handle({event, resolve}) {

    const protectRoutes = [
        '/add',
        '/edit',
        '/profile'
    ];

    const guessRoutes = [
        '/login',
        '/signup',
        '/forgot-password'
    ];

    console.log('Handling request for path:', event.url.pathname); // Log the requested path

    try {
        event.locals.user = await getFirebaseUser(event.cookies.get('jwt'))
        console.log('User authenticated:', event.locals.user ? `User ID: ${event.locals.user.id}` : 'No user'); // Log authentication status
    } catch (error) {
        console.error('Authentication error:', error.message); // Log authentication errors
        event.locals.user = null;
    }

    const user = event.locals?.user;
    const url = event.url;

    console.log('Route check:', { 
        path: url.pathname, 
        isProtected: protectRoutes.find(u => url.pathname.indexOf(u) > -1) ? true : false,
        isGuessRoute: guessRoutes.find(u => url.pathname.indexOf(u) > -1) ? true : false,
        hasUser: !!user
    }); // Log route check details

    if (url.pathname !== '/') {
        if (!user && protectRoutes.find(u => url.pathname.indexOf(u) > -1)) {
            console.log('Redirecting to login: protected route without user'); // Log redirect reason
            throw redirect(302, `/login?redirect=${url.pathname}`);
        }
        if (user && guessRoutes.find(u => url.pathname.indexOf(u) > -1)) {
            console.log('Redirecting to home: guest route with user'); // Log redirect reason
            throw redirect(302, '/');
        }
    }

    console.log('About to resolve route:', url.pathname); // Log before resolution
    const response = await resolve(event);
    console.log('Route resolved:', url.pathname, 'Status:', response.status); // Log after resolution

    return response;
}

async function getFirebaseUser(token) {
    if (!token) {
        console.log('No JWT token found'); // Log missing token
        return null;
    }

    try {
        const decodedToken = await auth.verifyIdToken(token, true);
        const user = await auth.getUser(decodedToken.uid);
        console.log('Firebase user retrieved:', user.uid); // Log successful user retrieval

        return {
            id: user.uid,
            email: user.email
        }
    } catch (error) {
        console.error('Error verifying token or getting user:', error.message); // Log token verification errors
        return null;
    }
}