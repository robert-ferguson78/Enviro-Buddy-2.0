import { doc, collection, query, where, getDocs, addDoc, orderBy, Timestamp, getDoc, onSnapshot, serverTimestamp, limit } from "firebase/firestore";
import { db } from '../firebase.client.js';

const collectionName = "chats";

// reactive state management for Svelte 5
let $state = {
    activeChats: [],
    currentMessages: [],
    unreadCount: 0
};

// Derived values for reactive data
const $derived = {
    hasUnreadMessages: () => $state.unreadCount > 0
};

export const chatsFirestoreStore = {
    getMessagesRealtime: function(chatId, callback) {
        const messagesRef = collection(doc(db, collectionName, chatId), 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp'));
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            $state.currentMessages = messages; // update reactive state
            callback(messages);
        }, (error) => {
            console.error(`Error setting up real-time listener:`, error);
        });
        return unsubscribe;
    },

    getUnreadNotificationsCount: async function(chatId, userId) {
        const notificationsRef = collection(doc(db, collectionName, chatId), 'notifications');
        const notificationsQuery = query(notificationsRef, where('read', '==', false), where('receiverId', '==', userId));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        $state.unreadCount = notificationsSnapshot.size; // update reactive state
        return notificationsSnapshot.size;
    },

    // Function to get messages for a specific chat
    getMessages(chatId, callback) {
        const messagesRef = collection(doc(db, collectionName, chatId), 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp'));
        return onSnapshot(messagesQuery, async (snapshot) => {
            const msgs = [];
            snapshot.forEach((doc) => {
                msgs.push(doc.data());
            });
            $state.currentMessages = msgs; // update reactive state
            const chatData = await this.getChat(chatId);
            callback(msgs, chatData.userNames);
        });
    },

    // Function to send a message in a specific chat
    sendMessage: async function(chatId, message, senderId, receiverId, senderName) {
        const messagesRef = collection(doc(db, collectionName, chatId), 'messages');
        await addDoc(messagesRef, {
            text: message,
            timestamp: Timestamp.now(),
            senderId: senderId,
            receiverId: receiverId,
            senderName: senderName
        });

        // Add a new notification
        const notificationsRef = collection(db, 'notifications');
        await addDoc(notificationsRef, {
            chatId: chatId,
            receiverId: senderId,
            senderName: senderName,
            timestamp: Timestamp.now(),
            read: false
        });
    },

    // Function to get all chats for a specific user
    getChats: async function(userId) {
        // console.log('getChats called with userId:', userId);
        const chatsRef = collection(db, collectionName);
        const chatsQuery = query(chatsRef, where('userIds', 'array-contains', userId));
        const chatsSnap = await getDocs(chatsQuery);
        // console.log('chatsSnap:', chatsSnap);
        const chats = chatsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        $state.activeChats = chats; // update reactive state
        // console.log('chats:', chats);
        return chats;
    },

    // Function to get a chat by its ID
    getChat: async function(chatId) {
        const chatRef = doc(db, collectionName, chatId);
        const chatSnap = await getDoc(chatRef);
        if (chatSnap.exists()) {
            return { id: chatSnap.id, ...chatSnap.data() };
        } else {
            throw new Error("No such chat exists!");
        }
    },

    // Function to create a new chat between two users
    createChat: async function(userId1, userId2, userName1, userName2) {
        // console.log('userId1:', userId1);
        // console.log('userId2:', userId2);
        // console.log('userName1:', userName1);
        // console.log('userName2:', userName2);
        // console.log('timestamp:', serverTimestamp());
        const chatData = {
            userIds: [userId1, userId2],
            userNames: [userName1, userName2],
            timestamp: serverTimestamp(),
        };
        const chatRef = await addDoc(collection(db, collectionName), chatData);
        return chatRef.id;
    },

    // Function to get chats in realtime
    getChatsRealtime: function(userId, callback) {
        const chatsRef = collection(db, collectionName);
        const chatsQuery = query(
            chatsRef, 
            where('userIds', 'array-contains', userId),
            orderBy('timestamp', 'desc'),
            limit(10)
        );
        
        return onSnapshot(chatsQuery, (snapshot) => {
            const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            $state.activeChats = chats; // update reactive state
            callback(chats);
        });
    }
};

// Export reactive state and derived values
export { $state, $derived };