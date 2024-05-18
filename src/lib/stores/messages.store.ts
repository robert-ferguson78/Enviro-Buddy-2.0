import { writable } from "svelte/store";

const PUBLIC_ERROR_MESSAGE = import.meta.env.VITE_PUBLIC_ERROR_MESSAGE;

const messageStore = writable({ show: false, message: '', type: 'error'})

export default {
    subscribe: messageStore.subscribe,
    showError: function(message = PUBLIC_ERROR_MESSAGE) {
        messageStore.set({ show: true, message, type: 'error'});
        setTimeout(() => {
            messageStore.set({ show: false, message: '', type: 'error'});
        }, 15000);
    },
    showSuccess: function(message: string) {
        messageStore.set({ show: true, message, type: 'success'});
        setTimeout(() => {
            messageStore.set({ show: false, message: '', type: 'error'});
        }, 15000);
    },
    hide: function() {
        messageStore.set({ show: false, message: '', type: 'error'});
    }
}