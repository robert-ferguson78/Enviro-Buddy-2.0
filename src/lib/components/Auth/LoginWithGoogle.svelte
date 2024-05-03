<script lang="ts">
    import { loginWithGoogle } from '$lib/firebase/auth.client.js';
    import { afterLogin } from '$lib/helpers/route.helper.js';
	import messagesStore from '$lib/stores/messages.store';
    import { page } from '$app/stores';

    async function loginGoogle() {
        try {
             const user = await loginWithGoogle();
             await afterLogin($page.url);
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