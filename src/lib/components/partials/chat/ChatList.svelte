<script>
    import { writable, get } from 'svelte/store';
    import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store';
    import { goto } from '$app/navigation'; 
    import { onMount } from 'svelte';
    import authStore from '$lib/stores/auth.store';
    import { chatIdStore } from '$lib/stores/chatIdStore';
    import { notificaionFirestoreStore } from '$lib/firebase/models/notifications-firestore-store';

    // Initialize an empty array for chats and a writable store for chats
    let chats = [];
    const chatsStore = writable([]);

    // Subscribe to the auth store
    let unsubscribe;

    onMount(() => {
    if ($authStore.userId) {
        unsubscribe = chatsFirestoreStore.getChatsRealtime($authStore.userId, (updatedChats) => {
            chatsStore.set(updatedChats);
        });
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };
});


    // Single store subscription
    $: chats = $chatsStore;

    // Function to select a chat
    function selectChat(chat) {
        // Update the chat ID and dealer user ID in the chat ID store
        chatIdStore.update(state => {
            return {
                ...state,
                chatId: chat.id,
                dealerUserId: chat.userIds.find(id => id !== $authStore.userId) // Assuming the other user in the chat is the dealer
            };
        });
        // Mark the notifications as read
        notificaionFirestoreStore.markNotificationsAsRead($authStore.userId, chat.id);
        // Navigate to the chat
        goto('/chat/' + chat.id);
    }

    // Function to format a timestamp
    function formatDate(timestamp) {
        const date = new Date(timestamp.toDate());
        const day = ("0" + date.getDate()).slice(-2);
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        return `Date: ${day}/${month}/${year} Time: ${hours}:${minutes}`;
    }

    // Function to get the dealer's name
    function getDealerName(chat) {
        const reversedUserIds = [...chat.userIds].reverse();
        const userIdIndex = reversedUserIds.findIndex(id => id === $authStore.userId);
        return chat.userNames[chat.userNames.length - 1 - userIdIndex];
    }
</script>

<!-- HTML and Svelte markup for the component -->
<div class="columns is-multiline">
    {#each chats as chat (chat.id)}
    <div class="column is-one-third">
        <div class="box">
            <h3>Chat with: <b>{getDealerName(chat)}</b></h3>
            <p>{formatDate(chat.timestamp)}</p>
            <p>Unread notifications: {chat.unreadCount}</p>
            <button class="button is-normal is-fullwidth mt-3 mb-3 has-brand-green-background" on:click={() => selectChat(chat)}>Go to chat</button>
        </div>
    </div>
    {/each}
</div>