import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { setUser } from '$lib/firebase/database.client.js';
import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store.js';

/**
 * Asynchronously log in a user with Google.
 *
 * @returns {Promise<Object>} - A promise that resolves with an object containing the user's ID and display name.
 * @throws {Error} - Throws an error if the login process fails.
 */
export async function loginWithGoogle() {
    try {
        // Get the auth object for the Firebase app
        const auth = getAuth();
        // console.log('Before signInWithPopup');

        // Sign in the user with a Google account using a popup
        const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
        // console.log('After signInWithPopup', userCredential);
        // console.log('userCredential:', userCredential);

        // Get the user's ID and display name from the userCredential object
        const userId = userCredential.user.uid;
        const userName = userCredential.user.displayName;
        // console.log('LoginWithGoogle fired');

        // Get user data from Firestore using getUser function
        const userData = await userFirestoreStore.getUser(userId);
        // If the user's data does not exist in Firestore, set the user in Firestore
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

/**
 * Asynchronously log out a user.
 */
export async function logout() {
    // Sign out the user from the Firebase app
    await signOut(getAuth());
    // Send a request to the '/logout' endpoint
    await fetch('/logout')
}

/**
 * Asynchronously register a user with an email and password.
 *
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<string>} - A promise that resolves with the user's ID.
 */
export async function registerWithEmailandPassword(email, password) {
    console.log("registerWithEmailandPassword called with email:", email);
    
    try {
        // Get the auth object for the Firebase app
        const auth = getAuth();
        console.log("Firebase auth object obtained");
        
        // Create a new user with the specified email and password
        console.log("About to call createUserWithEmailAndPassword");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created successfully:", userCredential.user.uid);
        
        // Return the user's ID
        return userCredential.user.uid;
    } catch (error) {
        console.error("Error in registerWithEmailandPassword:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        throw error; // Re-throw the error to be caught by the caller
    }
}
/**
 * Asynchronously log in a user with an email and password.
 *
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - A promise that resolves with the user object.
 */
export async function loginWithEmailandPassword(email, password) {
    // Get the auth object for the Firebase app
    const auth = getAuth();
    // Sign in the user with the specified email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Return the user object
    return userCredential.user;
}

/**
 * Asynchronously send a password reset email to a user.
 *
 * @param {string} email - The user's email.
 */
export async function mailResetPasswordEmail(email) {
    // Get the auth object for the Firebase app
    const auth = getAuth();
    // Send a password reset email to the specified email
    await sendPasswordResetEmail(auth, email);
}

/**
 * Asynchronously send a JWT token.
 */
export async function sendJWTToken() {
    // Get the auth object for the Firebase app
    const auth = getAuth();
    // Get the currently signed-in user
    const user = auth.currentUser;

    // If no user is signed in, return
    if (!user) {
        return;
    }

    // Get the user's ID token and send a request to the '/token' endpoint with the token and the user's email
    const token = await user.getIdToken(true);
    await fetch('/token', {
        method: 'POST',
        body: JSON.stringify({ token, email: user.email })
    });
}