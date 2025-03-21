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
        console.log("Validating form with:", { name, email, password: password ? "***" : null });
        let errors = []; // Array to store the errors

        if (!name) errors.push('Name is required');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
        
        // Updated regex to allow special characters
        const passwordValid = !forgotPassword && password && /^(?=.*[A-Za-z])(?=.*\d).{9,}$/.test(password);
        console.log("Password validation result:", passwordValid);
        
        if (!forgotPassword && !passwordValid) {
            errors.push('Password must be minimum 9 characters and contain letters and numbers');
        }

        if (errors.length > 0) {
            console.log("Validation errors:", errors);
            messageActions.showError(`There was an issue with registration: ${errors.join(', ')}`);
            return false;
        }

        console.log("Form validation successful");
        return true;
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        console.log("Form submitted");
        e.preventDefault(); // Prevent the default form submission
        if (validateForm()) { // If the form is valid
            console.log("Form is valid, dispatching submit event");
            // Dispatch the submit event to the parent component with the form data
            dispatch('submit', { name, email, password }); // Dispatch the submit event
        } else {
            console.log("Form validation failed");
        }
    };
</script>

<!-- HTML and Svelte markup for the component -->
<form onsubmit={handleSubmit}> <!-- refcatored from 'on:submit' to 'onsubmit' attribute -->
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