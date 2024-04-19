// place files you want to import through the `$lib` alias in this folder.
export { default as serviceAccount } from './firebase/firebase-secrets.server.json';

// Re-exporting modules from the 'firebase' directory
export { loginWithGoogle } from './firebase/auth.client';

// Re-exporting modules from the 'helpers' directory
export { afterLogin } from './helpers/route.helper';

// Re-exporting modules from the 'stores' directory
export { default as messagesStore } from './stores/messages.store';