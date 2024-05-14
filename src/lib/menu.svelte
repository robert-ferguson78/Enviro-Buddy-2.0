<script lang="ts">
  import { onDestroy } from 'svelte';
  import authStore from '$lib/stores/auth.store';
  import { logout } from '$lib/firebase/auth.client';
  import messagesStore from '$lib/stores/messages.store';
  import { goto } from '$app/navigation';
  import { userFirestoreStore } from '$lib/firebase/models/user-firestore.store';

  let user;

  const unsubscribe = authStore.subscribe(async value => {
    if (value && value.isLoggedIn && value.userId) {
      user = await userFirestoreStore.getUser(value.userId);
      // console.log(user, 'user object'); // Log the user object
      // console.log(user.user_id, 'user id here2');
    } else {
      user = null;
    }
  });

  async function onLogout() {
    try {
      await logout();
      goto('/');
    } catch(e) {
      messagesStore.showError();
    }
  }

  onDestroy(() => {
    unsubscribe();
  });
</script>

<nav class="navbar mb-6">
    <div class="container">
      <div class="navbar-brand">
        <slot />
      </div>
      <div class="navbar-menu" id="navMenu">
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
                <a id="envirobuddy" class="button" href="/"> Enviro-Buddy </a>
              {#if user && user.type === 'brand'}
                <a class="button" href={`/brand-dashboard/${user.user_id}`}> Brand Dashboard </a>
                <a class="button" href={`/profile/${user.user_id}`}>Profile</a>
              {/if}
              {#if user}
                <a class="button" href="/messages">Messages</a>
              {/if}
                <a id="about" class="button" href="/about"> About </a>
              {#if $authStore.isLoggedIn}
                <a on:click={onLogout} class="button" id="logout" href="/"> Log out </a>
              {:else}
                <a class="button" id="login" href="/login"> Log in </a>
                <a class="button" id="signup" href="/signup"> Sign up </a>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>