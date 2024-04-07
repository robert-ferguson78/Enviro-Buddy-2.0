import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export async function loginWithGoogle() {
    const auth = getAuth();
    const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
    return userCredential.user;
}

export async function logout() {
    await signOut(getAuth());
}

export async function registerWithEmailandPassword(email, password) {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function loginWithEmailandPassword(email, password) {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}