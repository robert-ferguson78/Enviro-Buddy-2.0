import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { setUser } from '$lib/firebase/database.client';
import { getUser } from '$lib/firebase/models/user-firestore.store';

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
        const userData = await getUser(userId);
        if (userData) {
            // User data exists in Firestore, return userId
            return userId;
        } else {
            // No user data in Firestore, create user with setUser
            await setUser(userId, userName);
            // console.log('After setUser');
            // Return userId
            return userId;
        }
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