import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';

export const load = async () => {
    try {
        const dealers = await dealerFirestoreStore.getAllDealers();

        // Fetch additional data for each dealer using Promise.all for parallel requests
        const dealersWithExtraInfo = await Promise.all(dealers.map(async dealer => {
            // Fetch user data to get brand information
            const userData = await userFirestoreStore.getUser(dealer.userId);
            // Fetch county data to get county name
            const countyData = await countyFirestoreStore.getCountyById(dealer.countyId);

            // Add extra data to dealer
            return {
                ...dealer,
                brand: userData.brand,
                county: countyData.county
            };
        }));

        // Verify we have data to return
        if (dealersWithExtraInfo.length > 0) {
            // Return data in a structured format for the page component
            // The 'props' property will be accessible via $props() in Svelte 5
            return { 
            props: { 
                dealers: dealersWithExtraInfo 
            } 
            };
        } else {
            throw new Error('Could not load data');
        }
    } catch (error) {
        console.error('Error in load function:', error.message); // Log error message
        return { status: 500, error: error.message };
    }
}