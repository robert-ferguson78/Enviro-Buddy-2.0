import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from '$lib/firebase/firebase.client';

export const notificaionFirestoreStore = {
    // Function to get real-time updates of unread notifications for a specific user
    getUnreadNotifications: function(userId, callback) {
        const notificationsRef = collection(db, 'notifications');
        const notificationsQuery = query(notificationsRef, where('receiverId', '==', userId), where('read', '==', false));

        // Listen for real-time updates
        return onSnapshot(notificationsQuery, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(notifications); // Call the callback with the notifications
        });
    },

    // Function to get real-time updates of unread notifications for a specific user and chat
    getUnreadNotificationsForChat: function(userId, chatId, callback) {
        const notificationsRef = collection(db, 'notifications');
        const notificationsQuery = query(notificationsRef, where('receiverId', '==', userId), where('chatId', '==', chatId), where('read', '==', false));
    
        // Listen for real-time updates
        return onSnapshot(notificationsQuery, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(notifications); // Call the callback with the notifications
        });
    },

    // Function to mark all unread notifications as read for a specific user and chat
    markNotificationsAsRead: async function(userId: string, chatId: string) {
        const notificationsRef = collection(db, 'notifications');
        const notificationsQuery = query(notificationsRef, where('receiverId', '==', userId), where('chatId', '==', chatId), where('read', '==', false));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const notifications = notificationsSnapshot.docs;
    
        // Update all matching notifications
        for (const notification of notifications) {
            const notificationRef = doc(db, 'notifications', notification.id);
            await updateDoc(notificationRef, { read: true });
        }
    },

    // Function to get the count of unread notifications for a specific user
    getUnreadNotificationCount: async function(userId: string) {
        const notificationsRef = collection(db, 'notifications');
        const notificationsQuery = query(notificationsRef, where('receiverId', '==', userId), where('read', '==', false));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        return notificationsSnapshot.size;
    },
}