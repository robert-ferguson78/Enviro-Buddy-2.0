<script lang="ts">
    import { loginWithGoogle } from '$lib/firebase/auth.client.js';
    import { afterLoginGoogle } from '$lib/helpers/route.helper.js';
    import messagesStore from '$lib/stores/messages.store';
    import { page } from '$app/stores';

    async function loginGoogle() {
        try {
            const userData = await loginWithGoogle();
            if (userData) {
                const url = new URL(window.location.href);
                console.log('redirect code fired')
                await afterLoginGoogle(url, userData.user_id);
            }
        } catch (e) {
            if ((e as any).code == 'auth/popup-closed-by-user') {
                return
            }
            // console.log(e);
            messagesStore.showError("There was an issue With sign in, please try again");
        }
    }
</script>

<div class="row">
    <div class="column"><button on:click={loginGoogle}>Login With Google</button></div>
</div>