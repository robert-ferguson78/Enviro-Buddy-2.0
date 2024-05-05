import { getAuth, onAuthStateChanged } from 'firebase/auth';
import  { readable } from 'svelte/store';

const is_client = typeof window !== 'undefined';

export default readable({ isActive: false, isLoggedIn: false, userId: ''}, (set) => {
    if (is_client) {
        onAuthStateChanged(getAuth(), (user) => {
            // console.log('Auth state changed', user);
            if (user) {
                console.log('User is signed in with uid:', user.uid)
                set({ isActive: true, isLoggedIn: true, userId: user.uid });
            } else {
                console.log('User is signed out');
                set({ isActive: false, isLoggedIn: false, userId: '' });
            }
        })
    }
})