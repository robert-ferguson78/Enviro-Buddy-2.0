<script>
    import { onMount } from 'svelte';
    import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store.svelte';
    import { chatIdStore } from '$lib/stores/chatIdStore';
    import auth from '$lib/stores/auth.store';
    import { get } from 'svelte/store';
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
    
    // refactored from 'export let' to using $props() rune for props
    const { activeChat } = $props();
    
    // refactored reactive statement to $derived
    let messages = $derived($messagesStore);
    
    // refactored regular variables to $state variables
    let chatMessages = $state([]);
    let newMessage = $state('');
    let userIdToName = $state({});
    let otherUserName = $state('');
    let user = $state(null);
    
    auth.subscribe(value => {
        user = value;
    });
    
    // refactored reactive statement to $effect
    $effect(() => {
        if (activeChat && activeChat.userIds) {
            const ids = activeChat.userIds;
            const names = activeChat.userNames;
    
            const idToName = ids.reduce((map, id, index) => {
                map[id] = names[index];
                return map;
            }, {});
    
            user.userName = idToName[user.userId];
        }
    });
    
    $effect(() => {
        if (activeChat && activeChat.userIds) {
            const ids = activeChat.userIds;
            const names = activeChat.userNames;
    
            const idToName = ids.reduce((map, id, index) => {
                map[id] = names[index];
                return map;
            }, {});
    
            otherUserName = idToName[user.userId === ids[0] ? ids[1] : ids[0]];
        }
    });
    
    function getMessages() {
        if (activeChat) {
            chatsFirestoreStore.getMessages(activeChat.id, (msgs, userNames) => {
                chatMessages = msgs;
                userIdToName = userNames.reduce((map, userName, index) => {
                    map[activeChat.userIds[index]] = userName;
                    return map;
                }, {});
            });
        }
    }
    
    onMount(async () => {
        const chatData = await chatsFirestoreStore.getChat(activeChat.id);
        const authUserId = activeChat.userIds[0];
        const dealerUserId = activeChat.userIds[1];
    
        chatIdStore.set({
            chatId: chatData.id,
            dealerUserId: dealerUserId,
            authUserId: authUserId
        });
    
        getMessages();
    });
    
    $effect(() => {
        getMessages();
    });
    
    async function sendMessage() {
        if (newMessage.trim() !== '' && activeChat) {
            let { authUserId, dealerUserId } = get(chatIdStore);
    
            if (user.userId === authUserId) {
                [authUserId, dealerUserId] = [dealerUserId, authUserId];
            }
    
            try {
                await chatsFirestoreStore.sendMessage(activeChat.id, newMessage, authUserId, dealerUserId, user.userName);
                getMessages();
                messageActions.showSuccess('Message sent successfully');
                newMessage = '';
            } catch (error) {
                messageActions.showError('Failed to send message');
                console.error('Error sending message:', error);
            }
        }
    }
    </script>
    
<h1 class="title has-text-centered">Chat with {otherUserName}</h1>
<div class="container-max-width">
    <div class="message-container">
        {#each chatMessages as message (message.timestamp)}
            <div class={message.senderName === userIdToName[user.userId] ? 'my-message' : 'your-message'}>
                <strong>
                    {message.senderName}<br/>
                    {message.text}
                </strong>
            </div>
        {/each}
    </div>
    <input
        class="input is-rounded mt-3"
        type="text"
        placeholder="Type a message...Hit ENTER to send"
        bind:value={newMessage}
        onkeydown={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        }}
    />
</div>

<style>
.container-max-width {
    max-width:450px;
    margin: auto;
}
.message-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.message-container strong {
    display: block;
    color: #fff;
    width: 250px;
}
.my-message, .your-message {
    border-radius: 8px;
    padding: 4px 8px;
    min-width:250px;
    margin-bottom: 15px;
}
.my-message {
    align-self: flex-start;
    background-color: green;
}
.your-message {
    align-self: flex-end;
    background-color: grey;
}
</style>    