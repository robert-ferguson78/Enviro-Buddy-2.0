import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';

export const load = async ({ params, locals }) => {
    try {
      if (!locals.user) {
        throw new Error('User not logged in');
      }

      // Get userId from URL params
      const userId = params.userId;
      console.log('Loading counties for userId from URL:', userId);
    
      // Fetch counties using the userId from the URL
      const counties = await countyFirestoreStore.getCountiesByUserId(userId);
      console.log('Counties loaded in server:', counties);
    
      // Always return the counties array, even if empty
      return { 
        props: { 
          counties,
          userId
        } 
      };
    } catch (error) {
      console.error('Error in load function:', error);
      return { status: 500, error: error.message };
    }
};