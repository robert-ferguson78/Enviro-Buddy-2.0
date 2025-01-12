import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
import { redirect } from '@sveltejs/kit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const load = async ({ params, locals }) => {
    try {
        if (!locals.user) {
            throw redirect(302, '/login');
        }

        const userId = params.userId;
        // console.log('Loading car types for user:', userId);
        const carTypes = await carTypeFirestoreStore.getCarTypesByBrandId(userId)
        // console.log('Found car types:', carTypes);
        // Return data even if no car types found
        return {
            props: {
                carTypes: carTypes || [],
                userId
            }
        };
    } catch (error) {
        if (error instanceof redirect) {
            throw error;
        }
        console.error('Error in load function:', error.message); // Log error message
        return { status: 500, error: error.message };
    }
}