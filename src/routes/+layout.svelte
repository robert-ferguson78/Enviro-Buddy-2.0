<script lang="ts">
  import "../app.css";
  import { headMetadata } from '$lib/stores/headStore';
  import EnviroBrandName from '$lib/envirobuddyBrand.svelte';
  import Menu from '$lib/menu.svelte';
  import '$lib/firebase/firebase.client';
  import messagesStore from '$lib/stores/messages.store';
	import { onMount } from "svelte";
	import { sendJWTToken } from "$lib/firebase/auth.client";
  let timerdId: NodeJS.Timeout;

async function sendServerToken() {
  try {
    await sendJWTToken();
  } catch(error) {
    clearInterval(timerdId);
    messagesStore.showError();
    console.log(error);
  }
}

onMount(() => {
  sendServerToken().then(() => {
    timerdId = setInterval(sendServerToken, 1000 * 10 * 60);
  }).catch(e => {
    console.log(e);
    messagesStore.showError();
  });

  return new Promise(() => {
    return () => {
      clearInterval(timerdId);
    }
  });
});

function closeMessage() {
  messagesStore.hide();
}
</script>

<svelte:head>
  <title>{$headMetadata.title}</title>
  <meta name="description" content={$headMetadata.description}>
</svelte:head>

<Menu>
  <EnviroBrandName />
</Menu>
<div class="container">
  {#if $messagesStore.show} 
  <article 
    class:is-danger={$messagesStore.type === 'error'}
    class:is-success={$messagesStore.type === 'success'}
    class="message"
    role="alert">
    <div class="message-header">
      <p>{$messagesStore.type === 'error' ? 'Error' : 'Success'}</p>
      <button on:click={closeMessage} class="delete" aria-label="delete"></button>
    </div>
    <div class="message-body">
      {$messagesStore.message}
    </div>
  </article>
  {/if}
  <slot />
</div>
<section class="footer is-size-6 has-text-centered"><b>Copyright Enviro-Buddy@2024</b></section>