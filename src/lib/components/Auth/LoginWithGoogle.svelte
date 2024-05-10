<script lang="ts">
    import { loginWithGoogle } from '$lib/firebase/auth.client.js';
    import { afterLoginGoogle } from '$lib/helpers/route.helper.js';
    import messagesStore from '$lib/stores/messages.store';
    import { page } from '$app/stores';
    import type { UserData } from '$lib/types/enviro-buddy-types';

    interface UserData {
        user_id: string;
        user_name: string;
    }

    async function loginGoogle() {
    try {
        const userData = await loginWithGoogle();
        console.log('loginGoogle: userData:', userData);
        if (userData && userData.uid && userData.displayName) {
            const url = new URL(window.location.href);
            afterLoginGoogle(url, userData.uid, userData.displayName);
        } else {
            console.error('loginGoogle: userData is null or undefined, or uid/displayName is missing');
        }
        } catch (error) {
            console.error('loginGoogle: error:', error);
            if (error.code !== 'auth/popup-closed-by-user') {
                messagesStore.showError("There was an issue With sign in, please try again");
            }
        }
    }
</script>

<div class="row">
    <div class="column"><button on:click={loginGoogle}>Login With Google</button></div>
</div>