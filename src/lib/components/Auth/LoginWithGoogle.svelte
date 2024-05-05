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
            const userData: UserData = await loginWithGoogle();
            if (userData) {
                const url = new URL(window.location.href);
                console.log('redirect code fired')
                let userId = userData.user_id;
                let userName = userData.user_name;
                await afterLoginGoogle(url, userId, userName);
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