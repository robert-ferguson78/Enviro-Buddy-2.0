import { writable } from 'svelte/store';

export const reviewIdStore = writable({
    chatId: null,
    dealerUserId: null,
    authUserId: null
});