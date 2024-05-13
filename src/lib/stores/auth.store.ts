import { getAuth, onAuthStateChanged } from 'firebase/auth';
import  { readable } from 'svelte/store';

const is_client = typeof window !== 'undefined';

export default readable({ isActive: false, isLoggedIn: false, userId: '', userName: '' }, (set) => {
    if (is_client) {
        onAuthStateChanged(getAuth(), (user) => {
            console.log('Auth state changed', user);
            if (user) {
                console.log('User is signed in with uid store:', user.uid)
                console.log('User is signed in with uid store:', user.displayName)
                set({ isActive: true, isLoggedIn: true, userId: user.uid, userName: user.displayName });
            } else {
                console.log('User is signed out');
                set({ isActive: false, isLoggedIn: false, userId: '', userName: '' });
            }
        })
    }
})