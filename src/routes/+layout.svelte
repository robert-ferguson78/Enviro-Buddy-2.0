<script>
    import "$lib/app.css"; // Use $lib alias for the CSS file
    import { headMetadata } from '$lib/stores/headStore';
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
