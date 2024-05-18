<script lang="ts">
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AuthFormDealership from '$lib/components/Auth/AuthFormDealer.svelte';
  import { registerWithEmailandPassword } from '$lib/firebase/auth.client';
	import { afterLogin } from '$lib/helpers/route.helper';
	import messagesStore from '$lib/stores/messages.store.js';
  import { page } from '$app/stores';
  import { setUserWithEmail } from '$lib/firebase/database.client';
  import type { SignUpUser } from "$lib/types/enviro-buddy-types";

  // Define a new interface for the custom event
  interface CustomEvent extends Event {
    detail: SignUpUser;
  }

  async function register(e: CustomEvent) {
    try {
      // console.log(e.detail); // Log the event target

      let name = e.detail.name as string;
      let brand = e.detail.brand as string;
      let email = e.detail.email as string;
      let password = e.detail.password as string;
      // console.log({ name, brand, email, password });

      let userId = await registerWithEmailandPassword(email, password);
      // console.log(userId);

      if (!userId) {
        console.error('User ID is undefined');
        return;
      }

      let user = {
          name: name,
          brand: brand,
          type: 'client',
          user_id: userId,
      };
      await setUserWithEmail(user);
      // console.log('User created'); // Log when the user is created

      afterLogin($page.url);
    } catch (error) {
      console.log((error as any).code);
      console.log(error.message);

      if ((error as any).code === 'auth/email-already-in-use') {
        messagesStore.showError('Email has already been registered');
      }
      // console.log(error);
      messagesStore.showError();
    }
  }
</script>

<UpdateHead title="Brand Signup" description="Driving your Electric Dreams Today" />

<section class="section">
  <h1 class="title">Brand Dealership Sign up</h1>
  <AuthFormDealership on:submit={register} btnName="Dealer Brand Sign up" />
</section>