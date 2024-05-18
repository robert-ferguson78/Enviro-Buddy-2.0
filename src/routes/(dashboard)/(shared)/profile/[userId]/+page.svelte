<script script="ts">
  import { onMount } from 'svelte';
  import authStore from '$lib/stores/auth.store';
  import AuthFormUpdate from '$lib/components/Auth/AuthFormUpdate.svelte'; // import the AuthFormUpdate component

  let userId;

  // Subscribe to the authStore to get the userId
  const unsubscribe = authStore.subscribe(value => {
    if (value && value.isLoggedIn) {
      userId = value.userId;
    }
  });

  onMount(() => {
    return () => {
      unsubscribe(); // Unsubscribe when the component is unmounted
    };
  });
</script>

<AuthFormUpdate {userId} btnName="Update Profile" />