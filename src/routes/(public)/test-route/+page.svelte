<script>
    import { routeStore } from '$lib/stores/routeStore.svelte';
    import TestRoute from './test-route.svelte';

    let waypoints = $state([
        { lat: 49.41461, lng: 8.681495 },
        { lat: 49.420318, lng: 8.687872 }
    ]);
</script>

<main>
    <h1>OpenRouteService Integration Test</h1>
    <TestRoute />
</main>