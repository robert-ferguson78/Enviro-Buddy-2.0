// auth.store.js
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { writable } from 'svelte/store';
import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';

// Initial state
const initialState = { 
  isActive: false, 
  isLoggedIn: false, 
  userId: '', 
  userName: '', 
  userType: '' 
};

// Create a writable store
const authStore = writable(initialState);

// Function to initialize the auth listener
function initAuth() {
  const auth = getAuth();
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('Auth state changed - User is signed in with uid:', user.uid);
      
      try {
        // Fetch user data from Firestore
        const userData = await userFirestoreStore.getUser(user.uid);
        
        if (userData) {
          console.log('Auth state changed - User data found in Firestore:', userData);
          
          // Update the store with user data
          authStore.update(_state => ({
            ..._state,
            isActive: true,
            isLoggedIn: true,
            userId: user.uid,
            userName: user.displayName || userData.name,
            userType: userData.type
          }));
        } else {
          console.log('Auth state changed - User data not found in Firestore, using default type: client');
          
          // Update with default values
          authStore.update(_state => ({
            ..._state,
            isActive: true,
            isLoggedIn: true,
            userId: user.uid,
            userName: user.displayName || '',
            userType: 'client'
          }));
        }
      } catch (error) {
        console.error('Auth state changed - Error fetching user data:', error);
        
        // Update with basic info on error
        authStore.update(_state => ({
          ..._state,
          isActive: true,
          isLoggedIn: true,
          userId: user.uid,
          userName: user.displayName || '',
          userType: 'client'
        }));
      }
    } else {
      console.log('Auth state changed - User is signed out');
      
      // Reset to initial state
      authStore.set(initialState);
    }
  });
}

// Initialize auth if in browser environment
if (typeof window !== 'undefined') {
  initAuth();
}

// Export a function to manually refresh user data
export async function refreshUserData() {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    console.log('Manually refreshing user data for:', user.uid);
    
    try {
      const userData = await userFirestoreStore.getUser(user.uid);
      
      if (userData) {
        console.log('Refresh - User data found:', userData);
        
        // Update the store with the latest user data


        authStore.update(_state => ({
          ..._state,
          userName: user.displayName || userData.name,
          userType: userData.type
        }));
        
        return true;
      } else {
        console.log('Refresh - User data not found');
        return false;
      }
    } catch (error) {
      console.error('Refresh - Error fetching user data:', error);
      return false;
    }
  }
  
  return false;
}

export default authStore;