import { writable } from 'svelte/store';
import { notificaionFirestoreStore } from '$lib/firebase/models/notifications-firestore-store';

function notificationStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    getUnreadNotifications(userId) {
      // Use the getUnreadNotifications method from the notificaionFirestoreStore
      const unsubscribe = notificaionFirestoreStore.getUnreadNotifications(userId, notifications => {
        set(notifications); // Set the Svelte store with the returned notifications
      });

      // Return the unsubscribe function
      return unsubscribe;
    },
    markNotificationsAsRead: async function(userId: string, chatId: string) {
        await notificaionFirestoreStore.markNotificationsAsRead(userId, chatId);
        notificaionFirestoreStore.getUnreadNotifications(userId, notifications => {
          set(notifications);
        });
      },
    getUnreadNotificationCount: async function(userId: string) {
      const count = await notificaionFirestoreStore.getUnreadNotificationCount(userId);
      return count;
    },
  }
}

export const notificationStoreInstance = notificationStore();