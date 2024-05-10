import admin from 'firebase-admin';

if (admin.apps.length === 0) {
    const project_id = import.meta.env.VITE_PROJECT_ID;
    const client_email = import.meta.env.VITE_CLIENT_EMAIL;
    const private_key = import.meta.env.VITE_PRIVATE_KEY.replace(/\\n/g, '\n');

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: project_id,
            clientEmail: client_email,
            privateKey: private_key
        })
    });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();