<script>
    // Importing the headMetadata store from the headStore file
    import { headMetadata } from './stores/headStore';

    // Exporting variables title and description, which can be passed as props to this component
    export let title = "";
    export let description = "";

    // Reactive statements that watch for changes in title and description
    // If title is not undefined, it updates the title in the headMetadata store
    $: if (title !== undefined) headMetadata.update((m) => ({ ...m, title }));

    // If description is not undefined, it updates the description in the headMetadata store
    $: if (description !== undefined) headMetadata.update((m) => ({ ...m, description }));
</script>