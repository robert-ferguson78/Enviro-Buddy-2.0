import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { setUser } from '$lib/firebase/database.client';
import { userFirestoreStore } from '$lib/firebase/models/user-firestore.store';

export async function loginWithGoogle() {
    try {
        const auth = getAuth();
        // console.log('Before signInWithPopup');
        const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
        // console.log('After signInWithPopup', userCredential);
        // Log the entire userCredential object        
        // console.log('userCredential:', userCredential);
        const userId = userCredential.user.uid;
        const userName = userCredential.user.displayName;
        // console.log('LoginWithGoogle fired');

        // Get user data from Firestore using getUser function
        const userData = await userFirestoreStore.getUser(userId);
        if (!userData) {
            await setUser(userId, userName);
        }

        // Always return an object with uid and displayName properties
        return {
            uid: userId,
            displayName: userName
        };
    } catch (error) {
        console.error('Error in loginWithGoogle', error);
        throw error;
    }
}

export async function logout() {
    await signOut(getAuth());
    await fetch('/logout')
}

export async function registerWithEmailandPassword(email: string, password: string) {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user.uid;
}

export async function loginWithEmailandPassword(email: string, password: string) {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function mailResetPasswordEmail(email: string) {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
}

export async function sendJWTToken() {
    const auth = getAuth();
    const user =  auth.currentUser;

    if (!user) {
        return;
    }

    const token = await user.getIdToken(true);
    await fetch('/token', {
        method: 'POST',
        body: JSON.stringify({ token, email: user.email })
    });


}