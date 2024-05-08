import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    try {
        console.log('locals.user:', locals.user); // Log locals.user
        if (!locals.user) {
            throw new Error('User not logged in');
        }
        const { id: userId } = locals.user;
        const carTypes = await carTypeFirestoreStore.getCarTypesByBrandId(userId)
        console.log('Car types in load function:', carTypes); // Log carTypes
        if (carTypes.length > 0) {
            const props = { carTypes };
            console.log('Returning props from load function:', props); // Log props
            return { props };
        } else {
            throw new Error('Could not load data');
        }
    } catch (error) {
        console.error('Error in load function:', error.message); // Log error message
        return { status: 500, error: error.message };
    }
}