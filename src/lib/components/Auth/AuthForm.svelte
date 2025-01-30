<script>
    import { createEventDispatcher } from 'svelte'; // Import the createEventDispatcher function from Svelte
    import { showError, showSuccess } from '$lib/stores/messages.store.svelte';// Import the messagesStore

    // Create an event dispatcher
    const dispatch = createEventDispatcher(); // Create an event dispatcher for dispatching custom events

    // Exported variables
    export let btnName; // Button name passed as a prop
    export let forgotPassword = false; // Boolean indicating whether the user is in the "forgot password" state, default is false

    // Local variables
    let name = ''; // Name input field value
    let email = ''; // Email input field value
    let password = ''; // Password input field value

    // Function to validate the form
    const validateForm = () => {
        let errors = []; // Array to store the errors

        // Check if the name and email are valid
        if (!name) errors.push('Name is required'); // If name is empty, add an error
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required'); // If email is empty or not valid, add an error

        // If the user is not in the "forgot password" state, check if the password is valid
        if (!forgotPassword && (!password || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/.test(password))) {
            errors.push('Password must be minimum 9 characters and contain letters and numbers'); // If password is empty or not valid, add an error
        }

        // If there are errors, show an error message and return false
        if (errors.length > 0) {
            showError(`There was an issue with registration: ${errors.join(', ')}`); // Show an error message
            return false; // Return false
        }

        // If there are no errors, return true
        return true; // Return true
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        if (validateForm()) { // If the form is valid
            console.log({ name, email, password }); // Log the form data
            // Dispatch the submit event to the parent component with the form data
            dispatch('submit', { name, email, password }); // Dispatch the submit event
        }
    };
</script>

<!-- HTML and Svelte markup for the component -->
<form on:submit|preventDefault={handleSubmit}> <!-- Form with onSubmit event handler -->
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