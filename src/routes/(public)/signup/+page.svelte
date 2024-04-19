<script lang="ts">
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AuthForm from '$lib/components/Auth/AuthForm.svelte';
	import LoginWithGoogle from '$lib/components/Auth/LoginWithGoogle.svelte';
  import { registerWithEmailandPassword } from '$lib/firebase/auth.client';
	import { afterLogin } from '$lib/helpers/route.helper';
	import messagesStore from '$lib/stores/messages.store.js';
  import { page } from '$app/stores';

  async function register(e: Event) {
    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const user = await registerWithEmailandPassword(email, password);
      afterLogin($page.url, user.uid);
    } catch (error) {
      // console.log((error as any).code);
      if ((error as any).code === 'auth/email-already-in-use') {
        messagesStore.showError('Email has already been registered');
      }
      console.log(error);
      messagesStore.showError();
    }
  }
</script>

<UpdateHead title="Signup" description="Driving your Electric Dreams Today" />

<section class="section">
  <h1 class="title">Sign up</h1>
  <AuthForm on:submit={register} btnName="Sign up" />
  <LoginWithGoogle />

  <!-- <form action="/register" method="POST">
    <div class="field is-horizontal">
      <div class="field-body">
        <div class="field">
            <label class="label" for="firstName-input">First Name</label>
          <input class="input" type="text" placeholder="Enter first name" name="firstName">
        </div>
        <div class="field">
            <label class="label" for="lastName">Last Name</label>
          <input class="input" type="text" placeholder="Enter last name" name="lastName">
        </div>
      </div>
    </div>
    <div class="field">
    <label class="label" for="email-input">Email</label> <input class="input" type="text" placeholder="Enter email" id="email-input" name="email">
    </div>
    <div class="field">
    <label class="label" for="password-input">Password</label> <input class="input" type="password" placeholder="Enter Password" id="password-input" name="password">
    </div>
    <div class="field is-grouped">
      <button class="button is-link">Submit</button>
    </div>
  </form> -->
</section>
