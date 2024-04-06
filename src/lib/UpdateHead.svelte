<script>
    import { headMetadata } from './headStore';
    export let title = "";
    export let description = "";
  
    // Update store on component initialization or prop changes
    $: if (title !== undefined) headMetadata.update((m) => ({ ...m, title }));
    $: if (description !== undefined) headMetadata.update((m) => ({ ...m, description }));
</script>