<script>
    import { onMount } from 'svelte';
    import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store'; // Import the userFirestoreStore
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';// Import the messagesStore

    // Declare exported variables
    export let btnName; // Button name passed as a prop
    export let userId; // User ID passed as a prop

    // Declare local variables
    let name = ''; // User's name
    let brand = ''; // User's car brand

    // When the component mounts, get the user's data and set the name and brand
    onMount(async () => {
        const user = await userFirestoreStore.getUser(userId); // Get the user's data
        if (user) {
            name = user.name; // Set the name
            brand = user.brand; // Set the brand
        }
    });

    // Function to handle form submission
    async function onSubmit() {
        const user = { name, brand }; // Create a user object
        try {
            await userFirestoreStore.updateUser(userId, user); // Update the user's data
            showSuccess('User profile has been updated successfully.'); // Show a success message
        } catch (error) {
            showError('An error occurred while updating the user profile.'); // Show an error message
        }
    }
</script>

<!-- HTML and Svelte markup for the component -->
<div class="box">
    <form on:submit|preventDefault={onSubmit}> <!-- Form with onSubmit event handler -->
        <div class="field">
            <label class="label" for="name">Name</label>
            <input class="input" type="text" bind:value={name} id="name" name="name">
        </div>
        <div class="field">
            <label class="label" for="brand">Car Brand</label>
            <input class="input" type="text" bind:value={brand} id="brand" name="brand">
        </div>
        <button class="button is-link">{btnName}</button>
    </form>
</div>