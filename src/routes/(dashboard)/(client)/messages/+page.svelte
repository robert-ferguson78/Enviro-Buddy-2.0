<script>
    import ChatList from '$lib/components/partials/chat/ChatList.svelte';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store';

    import { chatIdStore } from '$lib/stores/chatIdStore';

    onMount(async () => {
        console.log('chatId here:', $chatIdStore); // Log chatId
        if ($chatIdStore && $chatIdStore.chatId) {
            const chat = await chatsFirestoreStore.getChat($chatIdStore.chatId);
            console.log('chat:', chat); // Log chat
            if (chat) {
                activeChat.set(chat);
            }
        }
    });

</script>

<h1 class="title">My Chats</h1>
<ChatList />