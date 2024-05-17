<script lang="ts">
    import { onMount } from 'svelte';
    import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store';
    import { chatIdStore } from '$lib/stores/chatIdStore';
    import auth from '$lib/stores/auth.store';
    import { get } from 'svelte/store';

    export let activeChat;

    let user;
    auth.subscribe(value => {
        user = value;
        // console.log('user:', user.userId);
    });

    let messages = [];
    let newMessage = '';
    let userIdToName = {};
    let otherUserName = '';

    $$: if (activeChat && activeChat.userIds) {
        const ids = activeChat.userIds;
        const names = activeChat.userNames;

        // Map IDs to names
        const idToName = ids.reduce((map, id, index) => {
            map[id] = names[index];
            return map;
        }, {});

        // Get the name corresponding to authUserId
        user.userName = idToName[user.userId];
    }

    $: if (activeChat && activeChat.userIds) {
        const ids = activeChat.userIds;
        const names = activeChat.userNames;

        // Map IDs to names
        const idToName = ids.reduce((map, id, index) => {
            map[id] = names[index];
            return map;
        }, {});

        // Get the name corresponding to the other user
        otherUserName = idToName[user.userId === ids[0] ? ids[1] : ids[0]];
    }


    // Function to get messages
    function getMessages() {
        if (activeChat) {
            chatsFirestoreStore.getMessages(activeChat.id, (msgs, userNames) => {
                messages = msgs;
                userIdToName = userNames.reduce((map, userName, index) => {
                    map[activeChat.userIds[index]] = userName;
                    return map;
                }, {});
            });
        }
    }

    onMount(async () => {
        // Fetch chat data from Firestore
        const chatData = await chatsFirestoreStore.getChat(activeChat.id);

        // Fetch authUserId from the appropriate source
        const authUserId = activeChat.userIds[0];
        const dealerUserId = activeChat.userIds[1];

        // console.log('authUserId here:', authUserId);

        // Update chatIdStore with fetched data
        chatIdStore.set({
            chatId: chatData.id,
            dealerUserId: dealerUserId,
            authUserId: authUserId
        });

        // Fetch messages for the active chat
        getMessages();
    });

    // Create a reactive statement that runs whenever activeChat changes
    $: {
        getMessages();
    }

    async function sendMessage() {
        if (newMessage.trim() !== '' && activeChat) {
            let { authUserId, dealerUserId } = get(chatIdStore);

            // Check if senderId is the same as the ID of the logged in user
            if (user.userId === authUserId) {
                // console.log('Swapping senderId and receiverId', authUserId);
                // Swap receiverId and senderId
                [authUserId, dealerUserId] = [dealerUserId, authUserId];
                // console.log('Swapped senderId ', authUserId);
                // console.log('Swapped receiverId', dealerUserId);
            }

            await chatsFirestoreStore.sendMessage(activeChat.id, newMessage, authUserId, dealerUserId, user.userName)
                .then(() => {
                    getMessages(); // Fetch the latest messages after a message is sent
                })
                .catch(error => console.error('Error sending message:', error));
            newMessage = '';
        }
    }
    // console.log("value to check ", userIdToName);
</script>

<h1 class="title has-text-centered">Chat with {otherUserName}</h1>
<div class="container-max-width">
    <div class="message-container">
       {#each messages as message (message.timestamp)}
        <div class={message.senderName === userIdToName[user.userId] ? 'my-message' : 'your-message'}>
            <strong>
                {message.senderName}<br/>
                {message.text}
            </strong> 
        </div>
    {/each}
    </div>
    <input class="input is-rounded mt-3" type="text" placeholder="Type a message...Hit ENTER to send" 
    bind:value={newMessage} 
    on:keydown={(e) => {
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