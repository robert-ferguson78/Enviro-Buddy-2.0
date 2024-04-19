<script>
  import authStore from '$lib/stores/auth.store';
  import { logout } from '$lib/firebase/auth.client';
  import messagesStore from '$lib/stores/messages.store';
  import { goto } from '$app/navigation';

  async function onLogout() {
    try {
      await logout();
      goto('/');
    } catch(e) {
      messagesStore.showError();
    }
  }
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
              {#if $authStore.isLoggedIn}
                <a id="envirobuddy" class="button" href="/envirobuddy"> Enviro-Buddy </a>
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