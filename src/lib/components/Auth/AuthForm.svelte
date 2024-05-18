<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import messagesStore from '$lib/stores/messages.store';

    const dispatch = createEventDispatcher();

    export let btnName: string;
    export let forgotPassword = false;

    let name = '';
    let email = '';
    let password = '';

    const validateForm = () => {
        let errors = [];

        if (!name) {
            errors.push('Name is required');
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Valid email is required');
        }

        if (!forgotPassword && (!password || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/.test(password))) {
            errors.push('Password must be minimum 9 characters and contain letters and numbers');
        }

        if (errors.length > 0) {
            messagesStore.showError(`There was an issue with registration: ${errors.join(', ')}`);
            return false;
        }

        return true;
    };

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        if (validateForm()) {
            console.log({ name, email, password });
            // Dispatch the submit event to the parent component
            dispatch('submit', { name, email, password });
        }
    };
</script>

<form on:submit|preventDefault={handleSubmit}>
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