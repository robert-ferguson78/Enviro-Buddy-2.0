import { writable } from 'svelte/store';

// Create a writable store named 'reviewIdStore'
// This store holds an object with 'chatId', 'dealerUserId', and 'authUserId' properties, all initially set to null
export const reviewIdStore = writable({
    chatId: null,
    dealerUserId: null,
    authUserId: null
});