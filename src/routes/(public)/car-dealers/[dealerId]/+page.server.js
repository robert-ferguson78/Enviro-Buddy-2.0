import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';

export const load = async ( { params } ) => {
    try {
        // Extract the dealerId from the route parameters
        const dealersId = params.dealerId;
        // console.log('Dealer ID:', dealersId);
        const dealer = await dealerFirestoreStore.getDealerById(dealersId);

        // Fetch related data together for better performance
        const [userData, countyData] = await Promise.all([
            // Fetch user data to get brand information
            userFirestoreStore.getUser(dealer.userId),
            // Fetch county data to get county name
            countyFirestoreStore.getCountyById(dealer.countyId)
        ]);

        // Add extra data to dealer
        const dealerWithExtraInfo = {
            ...dealer,
            brand: userData.brand,
            county: countyData.county
        };

        // Return data in a structured format for the page component
        // The 'props' property will be accessible via $props() in Svelte 5
        return { 
            props: { 
            dealer: dealerWithExtraInfo 
            } 
        };
    } catch (error) {
        console.error('Error in load function:', error.message);
        return { status: 500, error: error.message };
    }
}