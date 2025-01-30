<script module>
import { writable } from 'svelte/store';

const PUBLIC_ERROR_MESSAGE = import.meta.env.VITE_PUBLIC_ERROR_MESSAGE;

// Create a writable store for SSR compatibility
const messagesStore = writable({
    show: false,
    message: '',
    type: 'error'
});

// Message management functions
function showMessage(message, type = 'error') {
    messagesStore.update(state => ({
        show: true,
        message,
        type
    }));
}

function hideMessage() {
    messagesStore.update(state => ({
        show: false,
        message: '',
        type: 'error'
    }));
}

// Public API
const messageActions = {
    showError: (message = PUBLIC_ERROR_MESSAGE) => {
        showMessage(message, 'error');
        setTimeout(hideMessage, 15000);
    },
    
    showSuccess: (message) => {
        showMessage(message, 'success');
        setTimeout(hideMessage, 5000);
    },
    
    hide: hideMessage
};

export { messagesStore, messageActions };
</script>