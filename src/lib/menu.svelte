<script>
    import { onDestroy } from 'svelte';
    import authStore, { refreshUserData } from '$lib/stores/auth.store';
    import { logout } from '$lib/firebase/auth.client';
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
    import { goto } from '$app/navigation';
    import { notificationStoreInstance } from '$lib/stores/notificationStore';

// Use $state for reactive variables
let unreadNotificationCount = $state(0);
let unsubscribeNotifications;

// Log the auth store value
console.log('authStore in menu:', $authStore);

// Effect to handle auth store changes
$effect(() => {
    const value = $authStore;
    console.log('Auth store update in menu:', value);
  
    if (value && value.isLoggedIn && value.userId) {
      // Set up notifications
      unsubscribeNotifications = notificationStoreInstance.getUnreadNotifications(value.userId);
    } else {
      unreadNotificationCount = 0;
    }
});

// Effect to handle notification changes
$effect(() => {
    if (unsubscribeNotifications) {
      const notifications = $notificationStoreInstance;
      unreadNotificationCount = notifications.filter(n => !n.read).length;
    }
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

// Cleanup on component destruction
onDestroy(() => {
    unsubscribeNotifications && unsubscribeNotifications();
});

// Function to refresh user data
async function handleRefreshUserData() {
    await refreshUserData();
}
</script>

<!-- Navigation bar -->
<nav class="navbar mb-6">
    <div class="container">
      <div class="navbar-brand">
        <slot />
      </div>
      <div class="navbar-menu" id="navMenu">
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <!-- Navigation buttons -->
              <a id="envirobuddy" class="button" href="/">Enviro-Buddy</a>
            
              <!-- Show admin menu item if user is an admin -->
              {#if $authStore.userType === 'admin'}
                <a class="button" href="/import-vehicles">Update EV Database</a>
              {/if}
            
              <!-- Show brand dashboard and profile buttons if user is a brand -->
              {#if $authStore.userType === 'brand'}
                <a class="button" href={`/brand-dashboard/${$authStore.userId}`}>Brand Dashboard</a>
                <a class="button" href={`/profile/${$authStore.userId}`}>Profile</a>
              {/if}
            
              <a id="envirobuddy" class="button" href="/car-dealers">Car Dealers</a>
            
              <!-- Show messages button if user is logged in -->
              {#if $authStore.isLoggedIn}
                <a class="button" href="/messages">
                  Messages
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