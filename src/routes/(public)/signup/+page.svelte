<script>
    import UpdateHead from '$lib/UpdateHead.svelte';
    import AuthForm from '$lib/components/Auth/AuthForm.svelte';
    import LoginWithGoogle from '$lib/components/Auth/LoginWithGoogle.svelte';
    import { registerWithEmailandPassword } from '$lib/firebase/auth.client';
    import { afterLogin } from '$lib/helpers/route.helper';
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
    import { page } from '$app/stores';
    import { setUserWithEmail } from '$lib/firebase/database.client';

    let isLoading = $state(false); // Loading state for the signup button

    async function register(e) {
        console.log("Register function called with:", e.detail);
        isLoading = true; // Start loading
        try {
            const { name, email, password } = e.detail;

            // Register the user with Firebase
            console.log("About to call registerWithEmailandPassword");
            const userId = await registerWithEmailandPassword(email, password);
            console.log('UserID returned from registration:', userId); // Log the userId

            // Create a user object
            const user = {
                name,
                brand: 'none',
                type: 'client',
                user_id: userId,
            };
            console.log("User object created:", user);

            // Save the user to Firestore
            console.log("About to call setUserWithEmail");
            await setUserWithEmail(user);
            console.log('User created in Firestore'); // Log when the user is created

            // Redirect after successful signup
            console.log("About to call afterLogin");
            await afterLogin($page.url);
            console.log("afterLogin completed");
        } catch (error) {
            console.error('Signup error:', error); // Log the full error
            console.error('Signup error code:', error.code); // Log the error code
            console.error('Signup error message:', error.message); // Log the error message

            // Handle specific errors
            if (error.code === 'auth/email-already-in-use') {
                messageActions.showError('Email has already been registered');
            } else {
                messageActions.showError('An error occurred during signup. Please try again.');
            }
        } finally {
            isLoading = false; // Stop loading
        }
    }
</script>

<UpdateHead title="Signup" description="Driving your Electric Dreams Today" />

<section class="section">
    <h1 class="title">Sign up</h1>
    <AuthForm on:submit={register} btnName={isLoading ? 'Signing up...' : 'Sign up'} disabled={isLoading} />
    <LoginWithGoogle />
    <p class="mt-3">Have an account already? <a href="/login">Login here</a>.</p>
</section>