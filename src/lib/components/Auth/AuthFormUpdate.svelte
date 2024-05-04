<script lang="ts">
    import { onMount } from 'svelte';
    import { getUser, updateUser } from '$lib/firebase/models/user-firestore.store'; // import your getUser function
    import messagesStore from '$lib/stores/messages.store';

    export let btnName: string;
    export let userId; // pass the user id as a prop

    let name = '';
    let brand = '';

    onMount(async () => {
        const user = await getUser(userId);
        if (user) {
            name = user.name;
            brand = user.brand;
        }
    });

    async function onSubmit() {
        const user = { name, brand };
        try {
            await updateUser(userId, user);
            messagesStore.showSuccess('User profile has been updated successfully.'); // set success message
        } catch (error) {
            messagesStore.showError('An error occurred while updating the user profile.'); // set error message
        }
    }
</script>

<form on:submit|preventDefault={onSubmit}>
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