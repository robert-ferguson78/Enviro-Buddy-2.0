import admin from 'firebase-admin';

// Check if any Firebase apps have been initialized
// If not, initialize a new Firebase app
if (admin.apps.length === 0) {
    // Get the project ID, client email, and private key from the environment variables
    const project_id = import.meta.env.VITE_PROJECT_ID;
    const client_email = import.meta.env.VITE_CLIENT_EMAIL;
    const private_key = import.meta.env.VITE_PRIVATE_KEY.replace(/\\n/g, '\n');

    // Initialize a new Firebase app with the specified credentials
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: project_id,
            clientEmail: client_email,
            privateKey: private_key
        })
    });
}

// Export the Firestore, Auth, and Storage services from the Firebase admin module
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();