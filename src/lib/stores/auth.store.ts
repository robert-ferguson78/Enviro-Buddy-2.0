import { getAuth, onAuthStateChanged } from 'firebase/auth';
import  { readable } from 'svelte/store';

// Check if the code is running in a client-side environment
const is_client = typeof window !== 'undefined';

// Export a readable Svelte store with an initial state
// The state includes 'isActive', 'isLoggedIn', 'userId', and 'userName' properties
export default readable({ isActive: false, isLoggedIn: false, userId: '', userName: '' }, (set) => {
    // If the code is running in a client-side environment
    if (is_client) {
        onAuthStateChanged(getAuth(), (user) => {
            // console.log('Auth state changed', user);
            // If a user is signed in
            if (user) {
                // console.log('User is signed in with uid store:', user.uid)
                // console.log('User is signed in with uid store:', user.displayName)
                // Set the store state to reflect that a user is signed in
                set({ isActive: true, isLoggedIn: true, userId: user.uid, userName: user.displayName });
            } else {
                // console.log('User is signed out');
                // If no user is signed in, set the store state to reflect that no user is signed in
                set({ isActive: false, isLoggedIn: false, userId: '', userName: '' });
            }
        })
    }
})