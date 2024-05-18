<script lang="ts">
    import ChatWindow from '$lib/components/partials/chat/ChatWindow.svelte';

    export let data: { props: { chat: string } };
    // console.log('data:', data);
    // console.log('chatId:', data.props.chatId);
    // console.log('chat:', data.props.chat);
</script>
 
<ChatWindow activeChat={data.props.chat} />