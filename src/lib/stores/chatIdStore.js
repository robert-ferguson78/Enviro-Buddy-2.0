import { writable } from 'svelte/store';

// This store holds an object with 'chatId', 'dealerUserId', and 'authUserId' properties, all initially set to null
export const chatIdStore = writable({
    chatId: null,
    dealerUserId: null,
    authUserId: null
});