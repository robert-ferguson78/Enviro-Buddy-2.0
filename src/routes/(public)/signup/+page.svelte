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
        isLoading = true; // Start loading
        try {
            const { name, email, password } = e.detail;

            // Register the user with Firebase
            const userId = await registerWithEmailandPassword(email, password);
            console.log('UserID:', userId); // Log the userId

            // Create a user object
            const user = {
                name,
                brand: 'none',
                type: 'client',
                user_id: userId,
            };

            // Save the user to Firestore
            await setUserWithEmail(user);
            console.log('User created'); // Log when the user is created

            // Redirect after successful signup
            await afterLogin($page.url);
        } catch (error) {
            console.error('Signup error:', error.code); // Log the error code

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
    <AuthForm onsubmit={register} btnName={isLoading ? 'Signing up...' : 'Sign up'} disabled={isLoading} />
    <LoginWithGoogle />
    <p class="mt-3">Have an account already? <a href="/login">Login here</a>.</p>
  </section>