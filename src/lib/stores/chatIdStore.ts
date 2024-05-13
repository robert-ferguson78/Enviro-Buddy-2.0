import { writable } from 'svelte/store';

export const chatIdStore = writable({
    chatId: null,
    dealerUserId: null,
    authUserId: null
});