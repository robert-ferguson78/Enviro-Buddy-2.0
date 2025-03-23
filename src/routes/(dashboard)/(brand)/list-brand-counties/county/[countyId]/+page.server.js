import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const load = async ({ locals, params }) => {
    try {
        // Authentication check: Verify user is logged in via locals
        // locals.user is populated by the SvelteKit hooks.server.js handle function
        if (!locals.user) {
            throw new Error('User not logged in');
        }

        // Extract the countyId from the route parameters
        // This comes from the [countyId] dynamic parameter in the route path
        const countyId = params.countyId;
        // console.log('County ID:', countyId); // Debug statement

        // Fetch dealers from Firestore that belong to this county
        // This uses the dealerFirestoreStore model to abstract database operations
        const dealers = await dealerFirestoreStore.getDealersByCountyId(countyId)
        // console.log('Dealers:', dealers); // Debug statement

        // Return the data in a structured format for the page component
        // The 'props' property is a convention used to pass data to the page
        return { 
            props: { 
                dealers,  // Array of dealer objects for this county
                countyId  // The county ID for reference in the page component
            } 
          };
    } catch (error) {
        // Error handling: Log the error and return an error response
        console.error('Error in load function:', error);

        // Return a 500 status code and the error message
        // This will trigger SvelteKit's error handling
        return { 
            status: 500, 
            error: error.message 
        };
    }
};