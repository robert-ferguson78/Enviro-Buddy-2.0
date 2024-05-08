import { is_client } from 'svelte/internal';
import { getApps, initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_PUBLIC_API_KEY,
    authDomain: import.meta.env.VITE_PUBLIC_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID,
    storageBucket: import.meta.env.VITE_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_PUBLIC_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_PUBLIC_API_ID,
    measurementId: import.meta.env.VITE_PUBLIC_MEASUREMENT_ID
};

export let app;
export let auth;

if (getApps().length == 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    if (is_client) {
        getAnalytics(app);
    }
}

export const db = getFirestore(app);
console.log('Firebase client initialized');