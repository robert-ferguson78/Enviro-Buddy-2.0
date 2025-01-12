import { writable } from "svelte/store";

// Get the public error message from the environment variables
const PUBLIC_ERROR_MESSAGE = import.meta.env.VITE_PUBLIC_ERROR_MESSAGE;

// Create a writable Svelte store with an initial state
const messageStore = writable({ show: false, message: '', type: 'error'})

export default {
    subscribe: messageStore.subscribe,
    // A method to show an error message
    // If no message is provided, it defaults to the public error message from the environment variables
    showError: function(message = PUBLIC_ERROR_MESSAGE) {
        // Set the store state to show the error message
        messageStore.set({ show: true, message, type: 'error'});
        // After 15 seconds, reset the store state to hide the message
        setTimeout(() => {
            messageStore.set({ show: false, message: '', type: 'error'});
        }, 15000);
    },
    // A method to show a success message
    showSuccess: function(message) {
        // Set the store state to show the success message
        messageStore.set({ show: true, message, type: 'success'});
        // After 15 seconds, reset the store state to hide the message
        setTimeout(() => {
            messageStore.set({ show: false, message: '', type: 'error'});
        }, 15000);
    },
    // A method to hide the message
    hide: function() {
        // Reset the store state to hide the message
        messageStore.set({ show: false, message: '', type: 'error'});
    }
}