<script>
    import { onMount, onDestroy } from 'svelte';
    import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store'; // Import the userFirestoreStore
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';// Import the messagesStore
    import auth from '$lib/stores/auth.store'; // Import Auth Store

    // Refactored from 'export let' to using $props() rune for props
    const { btnName } = $props();

    // Declare local variables
    let name = $state(''); // User's name
    let brand = $state(''); // User's car brand
    let user = $state(null); // Current user
    let isLoading = $state(true); // Loading state
    let currentAuthUser = $state(null); // Current authenticated user

    // Subscribe to the auth store to get the current user
    const unsubscribe = auth.subscribe(async (value) => {
        console.log('AuthFormUpdate: Auth state changed:', value);
        currentAuthUser = value; // Store the current auth user state
        
        if (value && value.isLoggedIn && value.userId) {
            try {
                console.log('AuthFormUpdate: Fetching user with ID:', value.userId);
                user = await userFirestoreStore.getUser(value.userId);
                
                if (user) {
                    name = user.name || '';
                    brand = user.brand || '';
                    console.log('AuthFormUpdate: User data loaded successfully');
                } else {
                    console.error('AuthFormUpdate: User not found');
                    messageActions.showError('User not found. Please try again later.');
                }
            } catch (error) {
                console.error('AuthFormUpdate: Error fetching user data:', error);
                messageActions.showError('Failed to load user data. Please try again later.');
            } finally {
                isLoading = false;
            }
        } else {
            console.log('AuthFormUpdate: User not logged in or missing userId');
            isLoading = false;
        }
    });

    // Clean up subscription when component is destroyed
    onDestroy(() => {
        unsubscribe();
    });

    // Function to handle form submission with error handling
    async function onSubmit(e) {
        e.preventDefault();
        
        if (!currentAuthUser || !currentAuthUser.userId) {
            messageActions.showError('Cannot update profile: User ID is missing');
            return;
        }
        
        const userData = { name, brand };
        try {
            await userFirestoreStore.updateUser(currentAuthUser.userId, userData);
            messageActions.showSuccess('User profile has been updated successfully.');
        } catch (error) {
            console.error('AuthFormUpdate: Error updating user:', error);
            messageActions.showError('An error occurred while updating the user profile.');
        }
    }
</script>

<!-- HTML and Svelte markup for the component -->
<div class="box">
    {#if isLoading} <!-- added loading state and error handling -->
        <div class="has-text-centered">
            <p>Loading user data...</p>
        </div>
    {:else if !currentAuthUser || !currentAuthUser.isLoggedIn}
        <div class="notification is-warning">
            <p>You need to be logged in to update your profile.</p>
            <a href="/login" class="button is-link mt-3">Login</a>
        </div>
    {:else}
        <form onsubmit={onSubmit}> <!-- refcatored from 'on:submit|preventDefault' to 'onsubmit' with preventDefault in the handler -->
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
    {/if}
</div>