<script> // Testing text search for waypouints (unfinished in development)
    import RouteMap from './RouteMap.svelte';
    import WaypointList from './WaypointList.svelte';
    import RouteControls from './RouteControls.svelte';
    import { routeStore, setRoute, addWaypoint } from '../../stores/routeStore.svelte.js';
    import { OpenRouteService } from '../../routeServices/openRouteService';
    import { ORSService } from '$lib/routeServices/orsService';
    import { orsConfig } from '$lib/routeServices/orsConfig';

    // Initialize reactive state variables
    let error = $state(null); // Error message state
    let searchText = $state(''); // Search input value
    let loading = $state(false); // Loading state for async operations

    // Initialize OpenRouteService with API key
    const orsService = new ORSService(orsConfig.apiKey);

    // Calculate route between waypoints
    async function calculateRoute() {
        if (routeStore.waypoints.length < 2) {
            console.log('Not enough waypoints to calculate route');
            return;
        }

        try {
            error = null;
            loading = true;
            console.log('Calculating route...');
            const route = await OpenRouteService.calculateRoute(routeStore.waypoints);
            setRoute(route);
            console.log('Route calculated:', route);
        } catch (err) {
            error = 'Failed to calculate route. Please try again.';
            console.error('Route calculation error:', err);
        } finally {
            loading = false;
        }
    }

    // Handle location search and waypoint addition
    async function handleSearch() {
        loading = true;
        error = null;

        try {
            console.log('Searching for location:', searchText);
            const result = await orsService.geocodeAddress(searchText);
            console.log('Geocoding result:', result);
            addWaypoint({ lat: result.coordinates[1], lng: result.coordinates[0] });
            console.log('Waypoint added from search:', { lat: result.coordinates[1], lng: result.coordinates[0] });
        } catch (err) {
            error = 'Failed to find location. Please try again.';
            console.error('Geocoding error:', err);
        } finally {
            loading = false;
        }
    }

    // Automatically calculate route when enough waypoints are added
    $effect(() => {
        if (routeStore.waypoints.length >= 2) {
            calculateRoute();
        }
    });
</script>

<div class="route-planner">
    <div class="map-container">
        <RouteControls />
        <RouteMap />
    </div>
    <div class="controls-container">
        <div class="search-box">
            <input
                type="text"
                bind:value={searchText}
                placeholder="Enter location (e.g., Heidelberg, Germany)"
            />
            <button onclick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Add Location'}
            </button>
        </div>
        <WaypointList />
        {#if error}
            <div class="error-message">
                {error}
            </div>
        {/if}
    </div>
</div>

<style>
    .route-planner {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
        padding: 1rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    .controls-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .search-box {
        display: flex;
        gap: 1rem;
    }

    .search-box input {
        flex: 1;
        padding: 0.5rem;
    }

    .search-box button {
        padding: 0.5rem 1rem;
    }

    .error-message {
        background: #fff3cd;
        color: #856404;
        padding: 0.75rem;
        border-radius: 4px;
        margin-top: 1rem;
    }

    @media (max-width: 768px) {
        .route-planner {
            grid-template-columns: 1fr;
        }
    }
</style>