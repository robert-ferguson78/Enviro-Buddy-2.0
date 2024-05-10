import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
import type { PageServerLoad } from "./dealers/$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    try {
        if (!locals.user) {
            throw new Error('User not logged in');
        }
        const countyId = params.countyId;
        console.log('County ID:', countyId); // Debug statement
        const dealers = await dealerFirestoreStore.getDealersByCountyId(countyId)
        console.log('Dealers:', dealers); // Debug statement
        if (dealers.length > 0) {
            const props = { dealers };
            return { props };
        } else {
            console.log('No dealers found in load function'); // Debug statement
            const props = { dealers: [] };
            return { props };
        }
    } catch (error) {
        console.error('Error:', error); // Debug statement
        return { status: 500, error };
    }
}