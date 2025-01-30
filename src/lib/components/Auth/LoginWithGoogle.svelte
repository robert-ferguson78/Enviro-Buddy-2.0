<script>
    import { loginWithGoogle } from '$lib/firebase/auth.client.js';
    import { afterLoginGoogle } from '$lib/helpers/route.helper.js';
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
    import { page } from '$app/stores';

    // Function to log in with Google
    async function loginGoogle() {
        try {
            // Call the loginWithGoogle function and get the user data
            const userData = await loginWithGoogle();
            // If the user data is valid, call the afterLoginGoogle function
            if (userData && userData.uid && userData.displayName) {
                const url = new URL(window.location.href);
                afterLoginGoogle(url, userData.uid, userData.displayName);
            } else {
                // If the user data is not valid, log an error
                console.error('loginGoogle: userData is null or undefined, or uid/displayName is missing');
            }
        } catch (error) {
            // If there's an error, log it and show an error message if the popup wasn't closed by the user
            console.error('loginGoogle: error:', error);
            if (error.code !== 'auth/popup-closed-by-user') {
                showError("There was an issue With sign in, please try again");
            }
        }
    }
</script>

<!-- HTML and Svelte markup for the component -->
<div class="row">
        <button class="button is-success is-active has-text-white mt-3" on:click={loginGoogle}>
            <span class="icon">
                <i class="fa-brands fa-google"></i>
              </span>
              <span>Login With Google</span>
        </button>
</div>