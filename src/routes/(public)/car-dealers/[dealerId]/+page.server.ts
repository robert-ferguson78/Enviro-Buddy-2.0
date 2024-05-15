import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
import { userFirestoreStore } from '$lib/firebase/models/user-firestore.store';
import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ( { params } ) => {
    try {
        const dealersId = params.dealerId;
        const dealer = await dealerFirestoreStore.getDealerById(dealersId);

        // Fetch user data
        const userData = await userFirestoreStore.getUser(dealer.userId);
        // Fetch county data
        const countyData = await countyFirestoreStore.getCountyById(dealer.countyId);

        // Add extra data to dealer
        const dealerWithExtraInfo = {
            ...dealer,
            brand: userData.brand,
            county: countyData.county
        };

        console.log('Dealer in load function:', dealerWithExtraInfo);
        const props = { dealer: dealerWithExtraInfo };
        console.log('Returning props from load function:', props);
        return { props };
    } catch (error) {
        console.error('Error in load function:', error.message);
        return { status: 500, error: error.message };
    }
}