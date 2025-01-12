<script>
    // Exported variables
    export let btnName; // Button name passed as a prop
    export let forgotPassword = false; // Boolean indicating whether the user is in the "forgot password" state, default is false
</script>

<!-- HTML and Svelte markup for the component -->
<form on:submit|preventDefault> <!-- Form with onSubmit event handler that prevents the default form submission -->
    <div class="field">
        <label class="label" for="email">Email</label>
        <input class="input" type="text" placeholder="Enter email" id="email" name="email">
    </div>
    {#if !forgotPassword} <!-- If the user is not in the "forgot password" state, show the password input field -->
        <div class="field">
            <label class="label" for="password">Password</label>
            <input class="input" type="password" placeholder="********" id="password" name="password">
        </div>
    {/if}
    <button class="button is-link">{btnName}</button> <!-- Submit button with the name passed as a prop -->
</form>