<script>
    import { createEventDispatcher } from 'svelte';
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';

    const dispatch = createEventDispatcher();

    // Use $props() for props
    const { btnName, forgotPassword = false } = $props();

    // Use $state for reactive variables
    let name = $state('');
    let email = $state('');
    let password = $state('');

    // Function to validate the form
    const validateForm = () => {
        let errors = []; // Array to store the errors

        if (!name) errors.push('Name is required');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
        if (!forgotPassword && (!password || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/.test(password))) {
            errors.push('Password must be minimum 9 characters and contain letters and numbers'); // If password is empty or not valid, add an error
        }

        if (errors.length > 0) {
            messageActions.showError(`There was an issue with registration: ${errors.join(', ')}`); // Show an error message
            return false; // Return false
        }

        return true; // Return true
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        if (validateForm()) { // If the form is valid
            // Dispatch the submit event to the parent component with the form data
            dispatch('submit', { name, email, password }); // Dispatch the submit event
        }
    };
</script>

<!-- HTML and Svelte markup for the component -->
<form onsubmit={handleSubmit}> <!-- Form with onSubmit event handler -->
    <div class="field">
        <label class="label" for="name">Name</label>
        <input class="input" type="text" placeholder="Enter Name" id="name" name="name" bind:value={name}>
    </div>
    <div class="field">
        <label class="label" for="email">Email</label>
        <input class="input" type="text" placeholder="Enter email" id="email" name="email" bind:value={email}>
    </div>
    {#if !forgotPassword}
        <div class="field">
            <label class="label" for="password">Password</label>
            <input class="input" type="password" placeholder="********" id="password" name="password" bind:value={password}>
        </div>
    {/if}
    <button class="button is-link">{btnName}</button>
</form>