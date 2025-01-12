import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store';
import { Timestamp } from 'firebase/firestore';

export async function load({ params }) {
    // console.log('load function running');
    const chatId = params.chatId;
    // console.log('id:', chatId); // Log id
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chat = await chatsFirestoreStore.getChat(chatId);
        // console.log('chat:', chat); // Log chat
        if (chat) {
            // Convert timestamp to string if it's a Firestore Timestamp
            if (chat.timestamp instanceof Timestamp) {
                chat.timestamp = chat.timestamp.toDate().toISOString();
            }
            // console.log('server id:', chatId);
            // console.log('server chat:', chat);
            const props = { 
                chatId: chatId, 
                chat: chat 
            };
            // console.log('props:', props); // Log props
            return { props: props };
        } else {
            console.error('Chat not found:', chatId);
        }
    } catch (error) {
        console.error('Error getting chat:', error);
    }
    return { props: {} }; // Return empty props if the chat is not found or an error occurs
}