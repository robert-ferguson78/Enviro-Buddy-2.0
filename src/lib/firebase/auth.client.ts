import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { setUserGoogle } from '$lib/firebase/database.client';

export async function loginWithGoogle() {
    const auth = getAuth();
    const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
    const userId = userCredential.user.uid;
    await setUserGoogle(userId);
    return userCredential.user;
}

export async function logout() {
    await signOut(getAuth());
    await fetch('/logout')
}

export async function registerWithEmailandPassword(email: string, password: string) {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
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