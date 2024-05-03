import { getAuth, onAuthStateChanged } from 'firebase/auth';
import  { readable } from 'svelte/store';

const is_client = typeof window !== 'undefined';

export default readable({ isActive: false, isLoggedIn: false, userId: ''}, (set) => {
    if (is_client) {
        onAuthStateChanged(getAuth(), (user) => {
            // console.log('Auth state changed', user);
            if (user) {
                set({ isActive: true, isLoggedIn: true, userId: user.uid });
            } else {
                set({ isActive: false, isLoggedIn: false, userId: '' });
            }
        })
    }
})