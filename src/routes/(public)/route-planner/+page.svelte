<script>
    import RouteMap from '$lib/components/EvRouteServices/RouteMap.svelte';
    import WaypointList from '$lib/components/EvRouteServices/WaypointList.svelte';
    import RouteControls from '$lib/components/EvRouteServices/RouteControls.svelte';
    import { routeStore } from '$lib/stores/routeStore.svelte.js';
    import DaySelector from '$lib/components/EvRouteServices/DaySelector.svelte';
    import EvResultsSection from '$lib/components/EvRouteServices/EvResultsSection.svelte';


    // State for showing/hiding EV Results
    let showEvResults = $state(false);

    // Centralized state management for multi-day routes
    let activeDay = $derived(routeStore.activeDay);
    let activeRouteData = $derived(routeStore.routes[activeDay]);
    let routes = $derived(routeStore.routes);
    let isEditing = $derived(routeStore.isEditing);

    // Updated handlers to work with daily routes
    function setRoute(newRoute) {
        console.log('Setting route:', newRoute);
        routeStore.routes[activeDay].route = newRoute;
    }

    // Toggle route editing mode
    function toggleEditing() {
        console.log('Toggling edit mode');
        routeStore.isEditing = !routeStore.isEditing;
    }

    // Clear all route data
    function handleClearRoute() {
        console.log('Clearing route for day:', activeDay);
        routeStore.routes[activeDay].waypoints = [];
        routeStore.routes[activeDay].route = null;
    }

    // Toggle EV Results visibility
    function toggleEvResults() {
        console.log('Toggling EV Results visibility');
        showEvResults = !showEvResults;
        console.log('showEvResults is now:', showEvResults);
    }

    // Check if any routes exist to enable/disable the EV Results button
    function hasAnyRoutes() {
        const hasRoutes = Object.values(routeStore.routes).some(day => day.route !== null);
        console.log('Checking for routes:', hasRoutes);
        return hasRoutes;
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
        totalWeeklyDuration={routeStore.totalWeeklyDuration}
        {showEvResults}
        {toggleEvResults}
        hasRoutes={hasAnyRoutes()}
    />
    
    <WaypointList
        {activeRouteData}
        {activeDay}
    />
    
    <!-- EV Results Section - conditionally rendered -->
    {#if showEvResults}
        <div class="ev-results-container">
            <EvResultsSection />
        </div>
    {/if}
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
    
    .ev-results-container {
        margin-top: 2rem;
    }
</style>