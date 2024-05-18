import { writable } from 'svelte/store';

// The initial value for 'title' and for 'description'
export const headMetadata = writable({
  title: 'Enviro-Buddy',
  description: 'Driving your Electric Dreams Today',
});