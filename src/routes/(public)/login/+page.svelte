<script lang="ts">
  import UpdateHead from '$lib/UpdateHead.svelte';
  import LoginWithGoogle from '$lib/components/Auth/LoginWithGoogle.svelte';
  import AuthForm from '$lib/components/Auth/AuthForm.svelte';
  import { loginWithEmailandPassword } from '$lib/firebase/auth.client';
	import messagesStore from '$lib/stores/messages.store';

  async function onLogin(e: Event) {
    try {
      const formdata = new FormData(e.target as HTMLFormElement);
      const email = formdata.get('email');
      const pasword = formdata.get('password');
      const user =  await loginWithEmailandPassword(email as string, pasword as string);
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
<AuthForm on:submit={onLogin} btnName="Login" />
<LoginWithGoogle />
<a href="/forgot-password">Forgot Password</a>

<section class="section">
  <h1 class="title">Log in</h1>
  <form action="/authenticate" method="POST">
    <div class="field">
    <label class="label" for="email-input">Email</label> <input class="input" type="text" placeholder="Enter email" name="email" id="email-input">
    </div>
    <div class="field">
    <label class="label" for="password-input">Password</label> <input class="input" type="password" placeholder="Enter Password" name="password" id="password-input">
    </div>
    <div class="field is-grouped">
      <button class="button is-link">Submit</button>
    </div>
  </form>
</section>
