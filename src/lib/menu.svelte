<script>
  import { onDestroy } from 'svelte';
  import authStore from '$lib/stores/auth.store';
  import { logout } from '$lib/firebase/auth.client';
  import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
  import { goto } from '$app/navigation';
  import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
  import { notificationStoreInstance } from '$lib/stores/notificationStore';
  console.log('authStore:', $authStore); // Debug the store value

  // Variables to hold user data, unread notification count and unsubscribe function
  let user;
  let unreadNotificationCount = 0;
  let unsubscribeNotifications;

  // Subscribing to the authStore
  const unsubscribe = authStore.subscribe(async value => {
      if (value && value.isLoggedIn && value.userId) {
          // If user is logged in, fetch user data and notifications
          user = await userFirestoreStore.getUser(value.userId);
          unsubscribeNotifications = notificationStoreInstance.getUnreadNotifications(value.userId);
      } else {
          // If user is not logged in, reset user data and unread notification count
          user = null;
          unreadNotificationCount = 0;
      }
  });

  // Subscribing to the notificationStoreInstance
  unsubscribeNotifications = notificationStoreInstance.subscribe(notifications => {
      // Counting the number of unread notifications
      unreadNotificationCount = notifications.filter(n => !n.read).length;
  });

  // Function to handle logout
  async function onLogout() {
      try {
          await logout();
          goto('/');
      } catch (e) {
          messageActions.showError('Failed to log out. Please try again.');
          console.error(e);
      }
  }

  // Unsubscribing from the stores when the component is destroyed
  onDestroy(() => {
      unsubscribe();
      unsubscribeNotifications && unsubscribeNotifications();
  });
</script>

<!-- Navigation bar -->
<nav class="navbar mb-6">
  <div class="container">
      <div class="navbar-brand">
          <!-- Slot to include child components -->
          <slot />
      </div>
      <div class="navbar-menu" id="navMenu">
          <div class="navbar-end">
              <div class="navbar-item">
                  <div class="buttons">
                      <!-- Navigation buttons -->
                      <a id="envirobuddy" class="button" href="/">Enviro-Buddy</a>
                      <!-- Show brand dashboard and profile buttons if user is a brand -->
                      {#if user && user.type === 'brand'}
                          <a class="button" href={`/brand-dashboard/${user.user_id}`}> Brand Dashboard </a>
                          <a class="button" href={`/profile/${user.user_id}`}>Profile</a>
                      {/if}
                      <a id="envirobuddy" class="button" href="/car-dealers">Car Dealers</a>
                      <!-- Show messages button if user is logged in -->
                      {#if user}
                          <a class="button" href="/messages">Messages
                              <!-- Show notification count if there are unread notifications -->
                              {#if unreadNotificationCount > 0}
                                  <span class="notification-count">{unreadNotificationCount}</span>
                              {/if}
                          </a>
                      {/if}
                      <a id="about" class="button" href="/about">About</a>
                      <!-- Show logout button if user is logged in, else show login and signup buttons -->
                      {#if $authStore.isLoggedIn}
                          <a onclick={onLogout} class="button" id="logout" href="/">Log out</a>
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

<!-- Styling for the notification count -->
<style>
  .notification-count {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: -15px;
      right: -8px;
      min-width: 25px;
      min-height: 25px;
      padding: 2px 6px;
      border-radius: 50%;
      border-width: 1px;
      border-color: #fff;
      background-color: #ff3220;
      color: white;
      font-size: 0.8em;
  }
</style>