import { getApps, initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const isBrowser = typeof window !== 'undefined';

// Define the configuration for the Firebase app
// The configuration values are retrieved from the environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_PUBLIC_API_KEY,
    authDomain: import.meta.env.VITE_PUBLIC_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID,
    storageBucket: import.meta.env.VITE_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_PUBLIC_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_PUBLIC_API_ID,
    measurementId: import.meta.env.VITE_PUBLIC_MEASUREMENT_ID
};

// Declare variables for the Firebase app and auth objects
export let app;
export let auth;

// If no Firebase apps have been initialized
if (getApps().length == 0) {
    // Initialize a new Firebase app with the specified configuration
    app = initializeApp(firebaseConfig);
    // Get the auth object for the Firebase app
    auth = getAuth(app);
    // If the code is running in a client-side environment, get the analytics object for the Firebase app
    if (isBrowser) {
        getAnalytics(app);
    }
}

// Get the Firestore object for the Firebase app and export it
export const db = getFirestore(app);
// Log a message to the console indicating that the Firebase client has been initialized
console.log('Firebase client initialized');