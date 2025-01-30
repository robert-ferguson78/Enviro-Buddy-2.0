<script>
    import ChatWindow from '$lib/components/partials/chat/ChatWindow.svelte';
    import { onMount } from 'svelte';
    
    /** @type {import('./$types').PageData} */
    export let data;
    
    let chat;
    
    onMount(() => {
        chat = data.props.chat;
    });
</script>
    
{#if chat}
    <ChatWindow activeChat={chat} />
{/if}