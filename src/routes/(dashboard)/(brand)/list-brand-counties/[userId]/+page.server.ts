import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';
import type { PageServerLoad } from "./$types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const load: PageServerLoad = async ({ locals }: { locals: any }) => {
    try {
        if (!locals.user) {
            throw new Error('User not logged in');
        }
        const { id: userId } = locals.user;
        const counties = await countyFirestoreStore.getCountiesByUserId(userId)
        // console.log('Counties in load function:', counties);
        if (counties.length > 0) {
            const props = { counties };
            // console.log('Returning props from load function:', props);
            return { props };
        } else {
            // throw new Error('Could not load data');
            // console.log('No counties found in load function');
            const props = { counties: [] };
            return { props };
        }
    } catch (error) {
        // console.error('Error in load function:', error);
        return { status: 500, error: error.message };
    }
}