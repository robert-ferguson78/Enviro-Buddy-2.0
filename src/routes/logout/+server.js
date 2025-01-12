import { json } from '@sveltejs/kit';

/** 
 * This is a GET request handler function.
 * @type {import('./$types').RequestHandler} 
 */
export async function GET({ cookies }) {
    // Deleting the 'jwt' cookie
    cookies.delete('jwt', { path: '/' });

    // Returning a JSON response with a message and a 200 status code
    return json({ message: 'Logged out' }, { status: 200 });
}