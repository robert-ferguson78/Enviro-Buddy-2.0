<script lang="ts">
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AuthForm from '$lib/components/Auth/AuthForm.svelte';
	import LoginWithGoogle from '$lib/components/Auth/LoginWithGoogle.svelte';
  import { registerWithEmailandPassword } from '$lib/firebase/auth.client';
	import { afterLogin } from '$lib/helpers/route.helper';
	import messagesStore from '$lib/stores/messages.store.js';
  import { page } from '$app/stores';
  import { setUserWithEmail } from '$lib/firebase/database.client';

  async function register(e: Event) {
    try {
      const formData = new FormData(e.target as HTMLFormElement);

      let name = formData.get('name') as string;
      let brand = formData.get('brand') as string;
      let email = formData.get('email') as string;
      let password = formData.get('password') as string;
      let userId = await registerWithEmailandPassword(email, password);
      // console.log(userId); // Log the userId
      let user = {
          name: name,
          brand: brand,
          type: 'brand',
          user_id: userId,
      };
      await setUserWithEmail(user);
      // console.log('User created'); // Log when the user is created
      afterLogin($page.url);
    } catch (error) {
      // console.log((error as any).code);
      if ((error as any).code === 'auth/email-already-in-use') {
        messagesStore.showError('Email has already been registered');
      }
      // console.log(error);
      messagesStore.showError();
    }
  }
</script>

<UpdateHead title="Signup" description="Driving your Electric Dreams Today" />

<section class="section">
  <h1 class="title">Sign up</h1>
  <AuthForm on:submit={register} btnName="Sign up" />
  <LoginWithGoogle />
</section>