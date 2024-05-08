import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
import type { PageServerLoad } from "./dealers/$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    try {
        if (!locals.user) {
            throw new Error('User not logged in');
        }
        const countyId = params.countyId;
        const dealers = await dealerFirestoreStore.getDealersByCountyId(countyId)
        if (dealers.length > 0) {
            const props = { dealers };
            return { props };
        } else {
            // throw new Error('Could not load data');
            console.log('No dealers found in load function');
            const props = { dealers: [] };
            return { props };
        }
    } catch (error) {
        return { status: 500, error };
    }
}