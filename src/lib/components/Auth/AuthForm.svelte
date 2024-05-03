<script lang="ts">
    export let btnName: string;
    export let forgotPassword = false;

</script>

<form on:submit|preventDefault>
    <div class="field">
        <label class="label" for="name">Name</label>
        <input class="input" type="text" placeholder="Enter Name" id="name" name="name">
    </div>
    <div class="field">
        <label class="label" for="email">Car Brand</label>
        <input class="input" type="text" placeholder="Enter email" id="brand" name="brand">
    </div>
    <div class="field">
        <label class="label" for="email">Email</label>
        <input class="input" type="text" placeholder="Enter email" id="email" name="email">
    </div>
    {#if !forgotPassword}
        <div class="field">
            <label class="label" for="password">Password</label>
            <input class="input" type="password" placeholder="********" id="password" name="password">
        </div>
    {/if}
    <button class="button is-link">{btnName}</button>
</form>