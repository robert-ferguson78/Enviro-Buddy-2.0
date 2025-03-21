<script>
    // Add import for problematic waypoints
    import { routeStore, routeActions } from '../../stores/routeStore.svelte.js';
    import { OpenRouteService } from '$lib/routeServices/openRouteService';
    // import ORS service to use location search
    import { ORSService } from '$lib/routeServices/orsService';
    import { orsConfig } from '$lib/routeServices/orsConfig';
    
    // Destructure needed actions from routeActions
    const { addWaypoint, deleteWaypoint, clearRoute } = routeActions;

    // Create derived values from the route store
    let { activeRouteData, activeDay } = $props();
    let waypoints = $derived(activeRouteData.waypoints);
    let route = $derived(activeRouteData.route);

    // address search setup
    let searchText = $state('');
    let loading = $state(false);
    const orsService = new ORSService(orsConfig.apiKey);

    // location search handler
    async function handleLocationSearch() {
        loading = true;
        try {
            const result = await orsService.geocodeAddress(searchText);
            addWaypoint({
                lat: result.coordinates[1],
                lng: result.coordinates[0],
                address: result.properties.label
            });
            searchText = ''; // Clear search after successful add
        } catch (error) {
            // console.error('Search error:', error);
        } finally {
            loading = false;
        }
    }

    // Format coordinate values to 4 decimal places
    function formatCoordinate(coord) {
        return coord.toFixed(4);
    }

    // Handle waypoint coordinate editing with validation
    async function editWaypoint(index, field, value) {
        const parsedValue = parseFloat(value);
        // Validate latitude range
        if (field === 'lat' && (parsedValue < -90 || parsedValue > 90)) {
            alert('Latitude must be between -90 and 90');
            return;
        }
        // Validate longitude range
        if (field === 'lng' && (parsedValue < -180 || parsedValue > 180)) {
            alert('Longitude must be between -180 and 180');
            return;
        }

        try {
        // Update waypoint with new value
        const updatedWaypoint = { ...routeStore.routes[activeDay].waypoints[index], [field]: parsedValue };
        await routeActions.updateWaypoint(index, updatedWaypoint);
        // console.log('Waypoint edited:', { index, field, value });

        // Recalculate route if we have at least 2 waypoints
            if (routeStore.routes[activeDay].waypoints.length >= 2) {
                const newRoute = await OpenRouteService.calculateRoute(routeStore.routes[activeDay].waypoints);
                routeStore.routes[activeDay].route = newRoute;
            }
        } catch (error) {
            // console.error('Error updating waypoint:', error);
        }
    }

    // Clear all waypoints and route (no confirmation pop up)
    function clearWaypoints() {
        clearRoute();
        // console.log('All waypoints cleared');
    }

    function moveWaypoint(index, direction) {
        const newWaypoints = [...activeRouteData.waypoints];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newWaypoints[index], newWaypoints[newIndex]] = [newWaypoints[newIndex], newWaypoints[index]];
    
        routeStore.routes[activeDay].waypoints = newWaypoints;
    
        // Recalculate route and save
        if (newWaypoints.length >= 2) {
            OpenRouteService.calculateRoute(newWaypoints)
                .then(newRoute => {
                    routeStore.routes[activeDay].route = newRoute;
                    // Call reorderWaypoints to ensure proper saving
                    routeActions.reorderWaypoints(newWaypoints);
                });
        } else {
            routeActions.reorderWaypoints(newWaypoints);
        }
    }

    // Added function to handle drag and drop
    function handleDrop(e, targetIndex) {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (sourceIndex !== targetIndex) {
            const newWaypoints = [...activeRouteData.waypoints];
            const [movedWaypoint] = newWaypoints.splice(sourceIndex, 1);
            newWaypoints.splice(targetIndex, 0, movedWaypoint);
            
            routeStore.routes[activeDay].waypoints = newWaypoints;
            
            // Recalculate route if needed
            if (newWaypoints.length >= 2) {
                OpenRouteService.calculateRoute(newWaypoints)
                    .then(newRoute => {
                        routeStore.routes[activeDay].route = newRoute;
                        routeActions.reorderWaypoints(newWaypoints);
                    });
            } else {
                routeActions.reorderWaypoints(newWaypoints);
            }
        }
    }
</script>

<div class="waypoint-list">
    <h3>Route Waypoints</h3>
    <div class="search-box">
        <input
            type="text"
            bind:value={searchText}
            placeholder="Search for a location to add"
            onkeydown={(e) => e.key === 'Enter' && searchText && handleLocationSearch()}
        />
        <!-- refcatored from 'on:click' to 'onclick' attribute -->
        <button onclick={() => searchText && handleLocationSearch()} disabled={loading || !searchText}>
            {loading ? 'Adding...' : 'Add Location'}
        </button>
    </div>
    {#if waypoints.length === 0}
        <p class="empty-state">
            Click on the map to add waypoints or 
            <button onclick={addWaypoint}>Add a Waypoint</button>
        </p>
    {:else}
        <ul>
            {#each waypoints as waypoint, index}
                <li 
                    draggable="true" 
                    ondragstart={(e) => e.dataTransfer.setData('text/plain', index)} 
                    ondrop={(e) => handleDrop(e, index)} 
                    ondragover={(e) => e.preventDefault()}
                >
                    <div class="waypoint-info">
                        <div class="reorder-controls">
                            <button 
                                class="reorder-btn"
                                onclick={() => moveWaypoint(index, 'up')}
                                disabled={index === 0}
                                title="Move up"
                            >
                                ↑
                            </button>
                            <button 
                                class="reorder-btn"
                                onclick={() => moveWaypoint(index, 'down')}
                                disabled={index === waypoints.length - 1}
                                title="Move down"
                            >
                                ↓
                            </button>
                        </div>
                        <span class="waypoint-number">{index + 1}</span>
                        <div class="coordinates">
                            <div class="address">{waypoint.address}</div>
                            <input
                                type="number"
                                step="0.001"
                                bind:value={waypoint.lat}
                                oninput={(e) => editWaypoint(index, 'lat', e.target.value)}
                            />
                            <input
                                type="number"
                                step="0.001"
                                bind:value={waypoint.lng}
                                oninput={(e) => editWaypoint(index, 'lng', e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        class="delete-btn"
                        onclick={() => deleteWaypoint(index)}
                        title="Delete waypoint"
                    >
                        ×
                    </button>
                </li>
            {/each}
        </ul>
        <button class="clear-btn" onclick={clearWaypoints}>Clear All</button>
        {#if route}
            <div class="route-summary">
                <p>Total Distance: {route.distanceKm} km</p>
                <p>Duration: {route.durationMinutes} minutes</p>
            </div>
        {/if}
    
    {/if}
</div>

<style>
    .waypoint-list {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
    }

    .reorder-controls {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .reorder-btn {
        background: none;
        border: none;
        color: #007bff;
        cursor: pointer;
        padding: 2px 4px;
        font-size: 1rem;
        line-height: 1;
    }

    .reorder-btn:disabled {
        color: #ccc;
        cursor: not-allowed;
    }

    .reorder-btn:hover:not(:disabled) {
        color: #0056b3;
    }

    h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #333;
    }

    .empty-state {
        color: #666;
        text-align: center;
        font-style: italic;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        padding: 0.5rem 1rem;
        margin: 0.5rem 0;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .waypoint-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
    }

    .waypoint-number {
        background: #007bff;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
    }

    .coordinates {
        flex: 1;
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }

    .coordinates input {
        width: 100%;
        max-width: 200px;
    }

    .delete-btn {
        background: none;
        border: none;
        color: #ff4444;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0 0.5rem;
    }

    .address {
        font-size: 0.9rem;
        color: #666;
        width: 100%;
    }

    .delete-btn:hover {
        color: #ff0000;
    }

    .clear-btn {
        background: #ff4444;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1rem;
    }

    .clear-btn:hover {
        background: #ff0000;
    }

    .route-summary {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #ddd;
    }

    .route-summary p {
        margin: 0.5rem 0;
        color: #666;
    }

    .route-summary {
        margin-top: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .route-summary p {
        margin: 0.5rem 0;
        font-size: 1.1rem;
        color: #333;
    }
    .search-box {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: white;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .search-box input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }

    .search-box button {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .search-box button:disabled {
        background: #ccc;
    }

    :global(.custom-marker-icon) {
        background: none;
        border: none;
    }

    :global(.marker-number) {
        width: 24px;
        height: 24px;
        background: #007bff;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.9rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
</style>
