<script>
    import RouteMap from '$lib/components/EvRouteServices/RouteMap.svelte';
    import WaypointList from '$lib/components/EvRouteServices/WaypointList.svelte';
    import RouteControls from '$lib/components/EvRouteServices/RouteControls.svelte';
    import { routeStore } from '$lib/stores/routeStore.svelte.js';

    // Create derived values from the route store using Svelte 5 runes
    let waypoints = $derived(routeStore.waypoints);
    let route = $derived(routeStore.route);
    let isEditing = $derived(routeStore.isEditing);

    // Handler for updating the current route
    function setRoute(newRoute) {
        routeStore.route = newRoute;
    }

    // Toggle route editing mode
    function toggleEditing() {
        routeStore.isEditing = !routeStore.isEditing;
    }

     // Clear all route data
    function handleClearRoute() {
        routeStore.waypoints = [];
        routeStore.route = null;
    }
</script>

<div class="route-planner">
    <h2>EV Route Planner</h2>
    <RouteControls 
        {waypoints}
        {route}
        {isEditing}
        {setRoute}
        {toggleEditing}
        {handleClearRoute}
    />
    <div class="route-container">
        <RouteMap />
        <WaypointList />
    </div>
</div>

<style>
    .route-planner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }

    h2 {
        color: #333;
        margin-bottom: 1rem;
    }

    .route-container {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
        margin-top: 1rem;
    }

    @media (max-width: 768px) {
        .route-container {
            grid-template-columns: 1fr;
        }
    }
</style>
