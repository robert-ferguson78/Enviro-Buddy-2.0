<script lang="ts">
    export let btnName: string;
</script>

<form on:submit|preventDefault>
    <div class="field">
        <label class="label" for="email">Email</label>
        <input class="input" type="text" placeholder="Enter email" id="email" name="email">
    </div>
    <div class="field">
        <label class="label" for="password">Password</label>
        <input class="input" type="password" placeholder="********" id="password" name="password">
    </div>
    <button class="button is-link">{btnName}</button>
</form>