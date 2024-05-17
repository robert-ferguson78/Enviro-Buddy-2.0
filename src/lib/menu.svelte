<script lang="ts">
  import { onDestroy } from 'svelte';
  import authStore from '$lib/stores/auth.store';
  import { logout } from '$lib/firebase/auth.client';
  import messagesStore from '$lib/stores/messages.store';
  import { goto } from '$app/navigation';
  import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
  import { notificationStoreInstance } from '$lib/stores/notificationStore';

  let user;
  let unreadNotificationCount = 0;
  let unsubscribeNotifications;

  const unsubscribe = authStore.subscribe(async value => {
    if (value && value.isLoggedIn && value.userId) {
      user = await userFirestoreStore.getUser(value.userId);

      // Fetch the notifications and store the unsubscribe function
      unsubscribeNotifications = notificationStoreInstance.getUnreadNotifications(value.userId, () => {});
    } else {
      user = null;
      unreadNotificationCount = 0;
    }
  });

  // Subscribe to notifications
  unsubscribeNotifications = notificationStoreInstance.subscribe(notifications => {
    unreadNotificationCount = notifications.filter(n => !n.read).length;
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
    notificationStoreInstance.unsubscribe && notificationStoreInstance.unsubscribe();
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
                <a id="envirobuddy" class="button" href="/">Enviro-Buddy</a>
              {#if user && user.type === 'brand'}
                <a class="button" href={`/brand-dashboard/${user.user_id}`}> Brand Dashboard </a>
                <a class="button" href={`/profile/${user.user_id}`}>Profile</a>
              {/if}
                <a id="envirobuddy" class="button" href="/car-dealers">Car Dealers</a>
                {#if user}
                  <a class="button" href="/messages">Messages {unreadNotificationCount > 0 ? `(${unreadNotificationCount})` : ''}</a>
              {/if}
                <a id="about" class="button" href="/about">About</a>
              {#if $authStore.isLoggedIn}
                <a on:click={onLogout} class="button" id="logout" href="/">Log out</a>
              {:else}
                <a class="button" id="login" href="/login">Log in</a>
                <a class="button" id="signup" href="/signup">Sign up</a>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>