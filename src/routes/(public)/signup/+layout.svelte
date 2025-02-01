<script>
    import UpdateHead from '$lib/UpdateHead.svelte';
    import AuthForm from '$lib/components/Auth/AuthForm.svelte';
    import LoginWithGoogle from '$lib/components/Auth/LoginWithGoogle.svelte';
    import { registerWithEmailandPassword } from '$lib/firebase/auth.client';
    import { afterLogin } from '$lib/helpers/route.helper';
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
    import { page } from '$app/stores';
    import { setUserWithEmail } from '$lib/firebase/database.client';

    // Define children using $props()
    const { children } = $props();

    async function register(e) {
        try {
            let name = e.detail.name;
            let email = e.detail.email;
            let password = e.detail.password;
            let userId = await registerWithEmailandPassword(email, password);
            console.log('User ID:', userId); // Log the userId
            let user = {
                name: name,
                brand: 'none',
                type: 'client',
                user_id: userId,
            };
            await setUserWithEmail(user);
            console.log('User created successfully'); // Log when the user is created
            afterLogin($page.url);
        } catch (error) {
            console.error('Signup error:', error); // Log the full error
            if (error.code === 'auth/email-already-in-use') {
                messageActions.showError('Email has already been registered');
            } else {
                messageActions.showError('An error occurred during signup. Please try again.');
            }
        }
    }
</script>

<!-- Render child content -->
{@render children()}