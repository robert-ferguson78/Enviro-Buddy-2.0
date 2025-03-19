import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    console.log('Import-vehicles page.server.js load function called');
    console.log('User in locals:', locals.user ? `ID: ${locals.user.id}, Type: ${locals.user.type}` : 'No user');
    
    // Check if user is logged in
    if (!locals.user) {
        console.log('Redirecting to login: no user');
        throw redirect(302, '/login?redirect=/import-vehicles');
    }
    
    // Instead of redirecting, just return the data if the user is logged in
    // We'll handle admin checks in the UI
    console.log('Import-vehicles load function completed successfully');
    return {
        isAdmin: locals.user.type === 'admin'
    };
}