<script>

    // implement runes props
    let { btnName, forgotPassword = false, onsubmit } = $props();

    // Function to handle form submission
    function handleSubmit(e) {
        e.preventDefault(); // moved prevent form submisison to here
        console.log('Form submitted'); // Log form submission
        onsubmit(e); // Call the onsubmit function passed as a prop
    }
</script>

<!-- HTML and Svelte markup for the component -->
<form onsubmit={handleSubmit}> <!-- Form with onSubmit event handler that prevents the default form submission -->
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