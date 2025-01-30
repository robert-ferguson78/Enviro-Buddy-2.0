import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store.svelte';
import { Timestamp } from 'firebase/firestore';

export async function load({ params }) {
    const chatId = params.chatId;
    try {
        const chat = await chatsFirestoreStore.getChat(chatId);
        if (chat) {
            // Convert Firestore timestamp to ISO string
            if (chat.timestamp instanceof Timestamp) {
                chat.timestamp = chat.timestamp.toDate().toISOString();
            }
            
            // Convert any message timestamps
            if (chat.messages) {
                chat.messages = chat.messages.map(msg => ({
                    ...msg,
                    timestamp: msg.timestamp instanceof Timestamp ? 
                        msg.timestamp.toDate().toISOString() : 
                        msg.timestamp
                }));
            }

            return { 
                props: { 
                    chatId, 
                    chat 
                } 
            };
        }
    } catch (error) {
        console.error('Error getting chat:', error);
    }
    return { props: {} };
}