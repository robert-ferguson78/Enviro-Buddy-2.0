<script>
    import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import authStore from '$lib/stores/auth.store';
    import { chatIdStore } from '$lib/stores/chatIdStore';
    import { notificaionFirestoreStore } from '$lib/firebase/models/notifications-firestore-store';

    // refactored regular variables to $state variables
    let chats = $state([]);

    // refcatored reactive statement to $derived
    let unreadCount = $derived(chatsFirestoreStore.state.unreadCount);

    onMount(() => {
        if ($authStore.userId) {
            return chatsFirestoreStore.getChatsRealtime($authStore.userId, async (updatedChats) => {
                // Set up real-time listeners for each chat
                updatedChats.forEach(chat => {
                    chatsFirestoreStore.watchUnreadNotifications($authStore.userId, chat.id, (count) => {
                        chat.unreadCount = count;
                        chats = [...updatedChats]; // Trigger reactivity
                    });
                });
                chats = updatedChats;
            });
        }
    });

    function selectChat(chat) {
        console.log('Selecting chat:', chat.id);
        // Using chat.unreadCount instead of global unreadCount
        console.log('Current unread count:', chat.unreadCount);
        
        const newState = {
            chatId: chat.id,
            dealerUserId: chat.userIds.find(id => id !== $authStore.userId)
        };
        chatIdStore.set(newState);
        
        console.log('Marking notifications as read');
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
    // Function to get chat participants
    function getChatParticipants(chat) {
        const currentUserIndex = chat.userIds.indexOf($authStore.userId);
        const userName = chat.userNames[currentUserIndex === 0 ? 1 : 0];
        const dealerName = chat.userNames[currentUserIndex === 1 ? 1 : 0];
        
        return `${userName} & ${dealerName}`;
    }
</script>

<div class="columns is-multiline">
    {#each chats as chat (chat.id)}
        <div class="column is-one-third">
            <div class="box">
                <h3>Chat with: <b>{getChatParticipants(chat)}</b></h3>
                <p>{formatDate(chat.timestamp)}</p>
                {#if chat.unreadCount > 0}
                    <p>Unread messages: {chat.unreadCount}</p>
                {/if}
                <button class="button is-normal is-fullwidth mt-3 mb-3 has-brand-green-background"
                    onclick={() => selectChat(chat)}>
                    Go to chat
                </button>
            </div>
        </div>
    {/each}</div>
