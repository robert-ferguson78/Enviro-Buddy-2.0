<script lang="ts">
  import UpdateHead from '$lib/UpdateHead.svelte';
  import LoginWithGoogle from '$lib/components/Auth/LoginWithGoogle.svelte';
  import AuthFormLogin from '$lib/components/Auth/AuthFormLogin.svelte';
  import { loginWithEmailandPassword } from '$lib/firebase/auth.client';
	import messagesStore from '$lib/stores/messages.store';
  import { page } from '$app/stores';
  import { afterLogin } from '$lib/helpers/route.helper';

  async function onLogin(e: Event) {
    try {
      const formdata = new FormData(e.target as HTMLFormElement);
      const email = formdata.get('email');
      const pasword = formdata.get('password');
      const user =  await loginWithEmailandPassword(email as string, pasword as string);
      await afterLogin($page.url);
    } catch (error) {
      console.log((error as any).code);
      if (['auth/invalid-email', 'auth/user-not-found', 'auth/wrong-password'].includes((error as any).code)) {
        messagesStore.showError('Invalid email or password');
        return;
      }
      // console.log((error as any).code);
      messagesStore.showError();
    }
  }
</script>

<UpdateHead title="Login" description="Driving your Electric Dreams Today" />

<h2>Login With Google</h2>
<AuthFormLogin on:submit={onLogin} btnName="Login" />
<LoginWithGoogle />
<a href="/forgot-password">
  <button class="button has-background-light mt-3">
    <span class="icon">
      <i class="fa-solid fa-lock"></i>
      </span>
      <span>Forgot Password</span>
  </button>
</a>