<script>
    import "$lib/app.css"; // Use $lib alias for the CSS file
    import { headMetadata } from '$lib/stores/headStore';
    console.log('Head metadata in layout:', $headMetadata);

    import EnviroBrandName from '$lib/envirobuddyBrand.svelte';
    import Menu from '$lib/menu.svelte';
    import '$lib/firebase/firebase.client';
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
    import { onMount } from "svelte";
    import { sendJWTToken } from "$lib/firebase/auth.client";

    // Use $state for reactive variables
    let timerId = $state(null); // Corrected spelling

    // Use $props() to define children
    const { children } = $props();

    // Function to send server token
    async function sendServerToken() {
        try {
            await sendJWTToken();
        } catch (error) {
            // Clear the interval if there's an error
            clearInterval(timerId);
            // Show error message
            messageActions.showError('Failed to send JWT token. Please try again.');
            console.error(error);
        }
    }

    // On mount, send server token and set an interval to keep sending it
    onMount(() => {
        sendServerToken().then(() => {
            timerId = setInterval(sendServerToken, 1000 * 10 * 60); // 10 minutes
        }).catch((e) => {
            console.error(e);
            messageActions.showError('Failed to initialize JWT token.');
        });

        // Clear the interval when the component is unmounted
        return () => {
            clearInterval(timerId);
        };
    });

    // Function to close the message
    function closeMessage() {
        messageActions.hide();
    }
</script>

<svelte:head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.0/css/bulma.min.css">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script src="https://kit.fontawesome.com/73983bf2e9.js" crossorigin="anonymous"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <!-- Setting the title and description of the page -->
    <title>{$headMetadata.title}</title>
    <meta name="description" content={$headMetadata.description}>
</svelte:head>

<!-- Including the Menu and EnviroBrandName components -->
<Menu>
    <EnviroBrandName />
</Menu>

<!-- Main content of the page -->
<div class="container">
    <!-- Show a message if there's one in the store -->
    {#if $messagesStore && $messagesStore.show}
        <article
            class:is-danger={$messagesStore.type === 'error'}
            class:is-success={$messagesStore.type === 'success'}
            class="message"
            role="alert"
        >
            <div class="message-header">
                <!-- Show the type of the message -->
                <p>{$messagesStore.type === 'error' ? 'Error' : 'Success'}</p>
                <!-- Button to close the message -->
                <button onclick={closeMessage} class="delete" aria-label="delete"></button>
            </div>
            <!-- Show the message -->
            <div class="message-body">
                {$messagesStore.message}
            </div>
        </article>
    {/if}

    <!-- Render child components -->
    {@render children()}
</div>
