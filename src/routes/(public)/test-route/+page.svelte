<script>
    import RouteMap from '$lib/components/EvRouteServices/RouteMap.svelte';
    import WaypointList from '$lib/components/EvRouteServices/WaypointList.svelte';
    import RouteControls from '$lib/components/EvRouteServices/RouteControls.svelte';
    import { routeStore } from '$lib/stores/routeStore.svelte.js';
    import DaySelector from '$lib/components/EvRouteServices/DaySelector.svelte';

    // Centralized state management for multi-day routes
    let activeDay = $derived(routeStore.activeDay);
    let activeRouteData = $derived(routeStore.routes[activeDay]);
    let routes = $derived(routeStore.routes);
    let isEditing = $derived(routeStore.isEditing);

    // Updated handlers to work with daily routes
    function setRoute(newRoute) {
        routeStore.routes[activeDay].route = newRoute;
    }

    // Toggle route editing mode
    function toggleEditing() {
        routeStore.isEditing = !routeStore.isEditing;
    }

     // Clear all route data
    function handleClearRoute() {
        routeStore.routes[activeDay].waypoints = [];
        routeStore.routes[activeDay].route = null;
    }
</script>

<div class="route-planner">
    <h2>EV Route Planner</h2>
    <RouteMap 
        {activeRouteData}
        {activeDay}
        {routes}
    />
    <DaySelector {activeDay} />
    <RouteControls
        {activeRouteData}
        {activeDay}
        {setRoute}
        {toggleEditing}
        {handleClearRoute}
        {isEditing}
        totalWeeklyDistance={routeStore.totalWeeklyDistance}
    />
    <WaypointList 
        {activeRouteData}
        {activeDay}
    />
</div>

<style>
    .route-planner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    h2 {
        color: #333;
        margin-bottom: 1rem;
    }
</style>
