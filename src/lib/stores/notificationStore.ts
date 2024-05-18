import { writable } from 'svelte/store';
import { notificaionFirestoreStore } from '$lib/firebase/models/notifications-firestore-store';

function notificationStore() {
  // Create a writable Svelte store with an initial value of an empty array
  const { subscribe, set } = writable([]);

  return {
    subscribe,
    // Get unread notifications for a specific user
    getUnreadNotifications(userId) {
      // Use the getUnreadNotifications method from the notificaionFirestoreStore
      const unsubscribe = notificaionFirestoreStore.getUnreadNotifications(userId, notifications => {
        set(notifications); // Set the Svelte store with the returned notifications
      });

      return unsubscribe;
    },
    // Mark notifications as read for a specific user and chat
    markNotificationsAsRead: async function(userId: string, chatId: string) {
        // Mark the notifications as read in the Firestore store
        await notificaionFirestoreStore.markNotificationsAsRead(userId, chatId);
        // Get the updated list of unread notifications and set the Svelte store with it
        notificaionFirestoreStore.getUnreadNotifications(userId, notifications => {
          set(notifications);
        });
      },
    // Get the count of unread notifications for a specific user
    getUnreadNotificationCount: async function(userId: string) {
      // Get the count of unread notifications from the Firestore store
      const count = await notificaionFirestoreStore.getUnreadNotificationCount(userId);
      return count;
    },
  }
}

// Create an instance of the notification store and export it
export const notificationStoreInstance = notificationStore();