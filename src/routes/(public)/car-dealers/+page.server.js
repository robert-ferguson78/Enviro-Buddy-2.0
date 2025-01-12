import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';

export const load = async () => {
    try {
        const dealers = await dealerFirestoreStore.getAllDealers();

        // Fetch additional data for each dealer
        const dealersWithExtraInfo = await Promise.all(dealers.map(async dealer => {
            // Fetch user data
            const userData = await userFirestoreStore.getUser(dealer.userId);
            // Fetch county data
            const countyData = await countyFirestoreStore.getCountyById(dealer.countyId);

            // Add extra data to dealer
            return {
                ...dealer,
                brand: userData.brand,
                county: countyData.county
            };
        }));

        // console.log('Dealers in load function:', dealersWithExtraInfo); // Log carTypes
        if (dealersWithExtraInfo.length > 0) {
            const props = { dealers: dealersWithExtraInfo };
            // console.log('Returning props from load function:', props); // Log props
            return { props };
        } else {
            throw new Error('Could not load data');
        }
    } catch (error) {
        console.error('Error in load function:', error.message); // Log error message
        return { status: 500, error: error.message };
    }
}