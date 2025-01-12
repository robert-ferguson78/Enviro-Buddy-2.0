import { json } from '@sveltejs/kit';
import { auth } from '$lib/firebase/firebase.server';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
    try {
        const { token, email } = await request.json();
        // console.log('Received token:', token); // Debug statement

        // If token is not provided, return an error
        if (!token) {
            console.log('No token provided'); // Debug statement
            return json({ message: 'No token provided' }, { status: 400 });
        }

        const verfiedToken = await auth.verifyIdToken(token, true);
        // console.log('Verified token:', verfiedToken); // Debug statement

        // If the token is not verified, return an error
        if (!verfiedToken) {
            console.log('Token not verified'); // Debug statement
            return json({ message: 'Token not verified' }, { status: 403 });
        }

        if (verfiedToken.email === email) {
            cookies.set('jwt', token, {
                maxAge: verfiedToken.exp - Date.now() / 1000, path: '/'
            })
            return json({ message: 'Success' }, { status: 200 });
        }
        // console.log('Email mismatch:', verfiedToken.email, email); // Debug statement
        return json({ message: 'Access Denied' }, { status: 403 });
    } catch(error) {
        console.log('Error:', error); // Debug statement
        return json({ message: 'Access Denied' }, { status: 403 });
    }
}