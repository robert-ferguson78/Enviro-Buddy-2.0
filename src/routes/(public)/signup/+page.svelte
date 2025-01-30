<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AuthForm from '$lib/components/Auth/AuthForm.svelte';
	import LoginWithGoogle from '$lib/components/Auth/LoginWithGoogle.svelte';
  import { registerWithEmailandPassword } from '$lib/firebase/auth.client';
	import { afterLogin } from '$lib/helpers/route.helper';
	import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
  import { page } from '$app/stores';
  import { setUserWithEmail } from '$lib/firebase/database.client';

  async function register(e) {
    try {
      let name = e.detail.name;
      let email = e.detail.email;
      let password = e.detail.password;
      let userId = await registerWithEmailandPassword(email, password);
      console.log(userId); // Log the userId
      let user = {
          name: name,
          brand: 'none',
          type: 'client',
          user_id: userId,
      };
      await setUserWithEmail(user);
      console.log('User created'); // Log when the user is created
      afterLogin($page.url);
    } catch (error) {
      console.log((error).code);
      if ((error).code === 'auth/email-already-in-use') {
        showError('Email has already been registered');
      }
      console.log(error);
      showError();
    }
  }
</script>

<UpdateHead title="Signup" description="Driving your Electric Dreams Today" />

<section class="section">
  <h1 class="title">Sign up</h1>
  <AuthForm on:submit={register} btnName="Sign up" />
  <LoginWithGoogle />
</section>