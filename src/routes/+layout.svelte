<script>
  import "../app.css";
  import { headMetadata } from '$lib/stores/headStore';
  import EnviroBrandName from '$lib/envirobuddyBrand.svelte';
  import Menu from '$lib/menu.svelte';
  import '$lib/firebase/firebase.client';
  import messagesStore from '$lib/stores/messages.store';

  function closeMessage() {
    messagesStore.hide();
  }
</script>

<svelte:head>
  <title>{$headMetadata.title}</title>
  <meta name="description" content={$headMetadata.description}>
  <meta charset="utf-8">
  <meta title="Enviro-Buddy">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" /> 
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="https://kit.fontawesome.com/3d6d0eb6bd.js" crossorigin="anonymous"></script>
  <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
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