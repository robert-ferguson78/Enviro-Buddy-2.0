<script>
    import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store';
    import { goto } from '$app/navigation'; 
    import { onMount } from 'svelte';
    import authStore from '$lib/stores/auth.store';
    import { chatIdStore } from '$lib/stores/chatIdStore';
    import { notificaionFirestoreStore } from '$lib/firebase/models/notifications-firestore-store';

    let chats = $state([]);

    onMount(() => {
        if ($authStore.userId) {
            return chatsFirestoreStore.getChatsRealtime($authStore.userId, (updatedChats) => {
                chats = updatedChats;
            });
        }
    });

    function selectChat(chat) {
        const newState = {
            chatId: chat.id,
            dealerUserId: chat.userIds.find(id => id !== $authStore.userId)
        };
        chatIdStore.set(newState);
        
        notificaionFirestoreStore.markNotificationsAsRead($authStore.userId, chat.id);
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

<div class="columns is-multiline">
    {#each chats as chat (chat.id)}
        <div class="column is-one-third">
            <div class="box">
                <h3>Chat with: <b>{getDealerName(chat)}</b></h3>
                <p>{formatDate(chat.timestamp)}</p>
                <p>Unread notifications: {chat.unreadCount}</p>
                <button class="button is-normal is-fullwidth mt-3 mb-3 has-brand-green-background" onclick={() => selectChat(chat)}>
                    Go to chat
                </button>
            </div>
        </div>
    {/each}
</div>