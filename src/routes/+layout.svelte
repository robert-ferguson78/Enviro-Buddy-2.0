<script lang="ts">
    import "../app.css";
    import { headMetadata } from '$lib/stores/headStore';
    import EnviroBrandName from '$lib/envirobuddyBrand.svelte';
    import Menu from '$lib/menu.svelte';
    import '$lib/firebase/firebase.client';
    import messagesStore from '$lib/stores/messages.store';
    import { onMount } from "svelte";
    import { sendJWTToken } from "$lib/firebase/auth.client";

    // Variable to hold the timer ID
    let timerdId: NodeJS.Timeout;

    // Function to send server token
    async function sendServerToken() {
        try {
            await sendJWTToken();
        } catch(error) {
            // Clear the interval if there's an error
            clearInterval(timerdId);
            // Show error message
            messagesStore.showError();
            console.log(error);
        }
    }

    // On mount, send server token and set an interval to keep sending it
    onMount(() => {
        sendServerToken().then(() => {
            timerdId = setInterval(sendServerToken, 1000 * 10 * 60);
        }).catch(e => {
            console.log(e);
            messagesStore.showError();
        });

        // Clear the interval when the component is unmounted
        return new Promise(() => {
            return () => {
                clearInterval(timerdId);
            }
        });
    });

    // Function to close the message
    function closeMessage() {
        messagesStore.hide();
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
    {#if $messagesStore.show} 
    <article 
        class:is-danger={$messagesStore.type === 'error'}
        class:is-success={$messagesStore.type === 'success'}
        class="message"
        role="alert">
        <div class="message-header">
            <!-- Show the type of the message -->
            <p>{$messagesStore.type === 'error' ? 'Error' : 'Success'}</p>
            <!-- Button to close the message -->
            <button on:click={closeMessage} class="delete" aria-label="delete"></button>
        </div>
        <!-- Show the message -->
        <div class="message-body">
            {$messagesStore.message}
        </div>
    </article>
    {/if}
    <!-- Slot to include child components -->
    <slot />
</div>