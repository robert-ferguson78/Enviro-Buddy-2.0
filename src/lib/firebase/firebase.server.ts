import admin from 'firebase-admin';
import serviceAccount from '$lib/firebase/firebase-secrets.server.json';

if (admin.apps.length === 0) {
    const { project_id, client_email, private_key } = serviceAccount;
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