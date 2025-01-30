<script>
    import { createEventDispatcher } from 'svelte';
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';

    // Create an event dispatcher
    const dispatch = createEventDispatcher();

     // Exported variables
    export let btnName;
    export let forgotPassword = false;

    let name = '';
    let brand = '';
    let email = '';
    let password = '';

    // Function to validate the form
    const validateForm = () => {
        let errors = []; // Array to store the errors

        // Check if the name, brand, and email are valid
        if (!name) errors.push('Name is required');
        if (!brand) errors.push('Brand is required');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');

        // If the user is not in the "forgot password" state, check if the password is valid
        if (!forgotPassword && (!password || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/.test(password))) {
            errors.push('Password must be minimum 9 characters and contain letters and numbers');
        }

        // If there are errors, show an error message and return false
        if (errors.length > 0) {
            showError(`There was an issue with registration: ${errors.join(', ')}`);
            return false;
        }

        // If there are no errors, return true
        return true;
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        if (validateForm()) { // If the form is valid
            console.log({ name, brand, email, password }); // Log the form data
            // Dispatch the submit event to the parent component with the form data
            dispatch('submit', { name, brand, email, password });
        }
    };
</script>

<form on:submit|preventDefault={handleSubmit}>
    <div class="field">
        <label class="label" for="name">Name</label>
        <input class="input" type="text" placeholder="Enter Name" id="name" name="name" bind:value={name}>
    </div>
    <div class="field">
        <label class="label" for="brand">Brand Name</label>
        <div class="select is-fullwidth">
            <select name="brandName" bind:value={brand}>
                <option value="audi">Audi</option>
                <option value="bmw">BMW</option>
                <option value="citroen">Citroen</option>
                <option value="dacia">Dacia</option>
                <option value="fiat">Fiat</option>
                <option value="ford">Ford</option>
                <option value="honda">Honda</option>
                <option value="hyundai">Hyundai</option>
                <option value="jaguar">Jaguar</option>
                <option value="kia">Kia</option>
                <option value="land_rover">Land Rover</option>
                <option value="lexus">Lexus</option>
                <option value="mazda">Mazda</option>
                <option value="mercedes_benz">Mercedes-Benz</option>
                <option value="mini">Mini</option>
                <option value="mitsubishi">Mitsubishi</option>
                <option value="nissan">Nissan</option>
                <option value="opel">Opel</option>
                <option value="peugeot">Peugeot</option>
                <option value="renault">Renault</option>
                <option value="seat">SEAT</option>
                <option value="skoda">Skoda</option>
                <option value="subaru">Subaru</option>
                <option value="suzuki">Suzuki</option>
                <option value="tesla">Tesla</option>
                <option value="toyota">Toyota</option>
                <option value="volkswagen">Volkswagen</option>
                <option value="volvo">Volvo</option>
              </select>
          </div>
    </div>
    <div class="field">
        <label class="label" for="email">Email</label>
        <input class="input" type="text" placeholder="Enter email" id="email" name="email" bind:value={email}>
    </div>
    {#if !forgotPassword}
        <div class="field">
            <label class="label" for="password">Password (minimum 9 characters, Must contain letters and numbers)</label>
            <input class="input" type="password" placeholder="********" id="password" name="password" bind:value={password}>
        </div>
    {/if}
    <button class="button is-link">{btnName}</button>
</form>