<script>
    import { routeStore, routeActions } from '../../stores/routeStore.svelte';
    import { OpenRouteService } from '$lib/routeServices/openRouteService';
    import { messageActions } from '$lib/stores/messages.store.svelte';

    // Update props to include EV Results related props
    let { 
        activeRouteData, 
        activeDay, 
        setRoute, 
        toggleEditing, 
        handleClearRoute, 
        isEditing, 
        totalWeeklyDistance, 
        totalWeeklyDuration,
        showEvResults,
        toggleEvResults,
        hasRoutes
    } = $props();

    // State for confirmation dialog using Svelte 5 runes
    let showConfirmClear = $state(false);

    // Calculate route using activeRouteData
    async function calculateRoute() {
        console.log('Calculate Route button clicked');
        if (activeRouteData.waypoints.length >= 2) {
            try {
                // Clear any previous problematic waypoints
                routeStore.problematicWaypoints = [];
                
                console.log('Calculating route with waypoints:', activeRouteData.waypoints);
                const result = await OpenRouteService.calculateRoute(activeRouteData.waypoints);
                console.log('Route calculation result:', result);
                
                setRoute(result);
            } catch (error) {
                console.error('Route calculation error:', error);
                
                // Handle specific error for waypoints not near roads
                if (error.type === 'WAYPOINTS_NOT_NEAR_ROAD') {
                    // Convert 0-based indices to 1-based for user display
                    const waypointNumbers = error.waypointIndices.map(idx => idx + 1);
                    
                    let errorMessage;
                    if (waypointNumbers.length === 1) {
                        errorMessage = `Waypoint ${waypointNumbers[0]} is not near a road. Please reposition it.`;
                    } else {
                        errorMessage = `Waypoints ${waypointNumbers.join(', ')} are not near roads. Please reposition them.`;
                    }
                    
                    // Use messageActions to show error
                    messageActions.showError(errorMessage);
                    
                    // Highlight problematic waypoints
                    routeStore.problematicWaypoints = error.waypointIndices;
                } else {
                    // Generic error message for other errors
                    messageActions.showError(`Failed to calculate route: ${error.message || 'Unknown error'}`);
                }
            }
        } else {
            console.log('Not enough waypoints to calculate route');
            messageActions.showError("At least 2 waypoints are required to calculate a route.");
        }
    }

    // Show confirmation dialog for route clearing
    function confirmClear() {
        console.log('Clear Route button clicked, showing confirmation');
        showConfirmClear = true;
    }

    // Hide confirmation dialog
    function cancelClear() {
        console.log('Clear Route cancelled');
        showConfirmClear = false;
    }

    // Clear route and hide confirmation dialog
    function clearRoute() {
        console.log('Clearing route confirmed');
        handleClearRoute();
        showConfirmClear = false;
        routeStore.problematicWaypoints = []; // Clear problematic waypoints
    }

    // Format duration into hours and minutes
    function formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    // Handle EV Results button click
    function handleEvResultsClick() {
        console.log('View EV Results button clicked');
        toggleEvResults();
    }
</script>

<div class="route-controls">
    <button onclick={calculateRoute}>Calculate Route</button>
    
    <button 
        class="edit-btn" 
        class:active={isEditing}
        onclick={toggleEditing}
    >
        {isEditing ? 'Done Editing' : 'Edit Route'}
    </button>

    <button onclick={confirmClear}>Clear Route</button>
    
    <!-- Add EV Results Button -->
    <button 
        class="ev-results-btn"
        class:active={showEvResults}
        onclick={handleEvResultsClick}
        disabled={!hasRoutes}
    >
        {showEvResults ? 'Hide EV Results' : 'View EV Results'}
    </button>

    <div class="route-totals">
        <div class="total-item">
            <span class="total-label">Weekly Distance:</span>
            <span class="total-value">{totalWeeklyDistance} km</span>
        </div>
        <div class="total-item">
            <span class="total-label">Total Drive Time:</span>
            <span class="total-value">{formatDuration(totalWeeklyDuration)}</span>
        </div>
    </div>

    {#if showConfirmClear}
        <div class="confirm-dialog">
            <p>Are you sure you want to clear the route?</p>
            <button class="confirm-btn" onclick={clearRoute}>Yes</button>
            <button class="clear-btn" onclick={cancelClear}>No</button>
        </div>
    {/if}
</div>

<style>
    .route-controls {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 8px;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
    }

    .edit-btn {
        background: #007bff;
        color: white;
    }

    .edit-btn:hover {
        background: #0056b3;
    }

    .edit-btn.active {
        background: #28a745;
    }
    
    .ev-results-btn {
        background: #28a745;
        color: white;
    }
    
    .ev-results-btn:hover {
        background: #218838;
    }
    
    .ev-results-btn.active {
        background: #dc3545;
    }
    
    .ev-results-btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
    }

    .clear-btn {
        background: #e9ecef;
        color: #333;
    }

    .clear-btn:hover {
        background: #dc3545;
        color: white;
    }

    .clear-btn:disabled {
        background: #e9ecef;
        cursor: not-allowed;
    }

    .confirm-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
    }

    .confirm-dialog p {
        margin: 0 0 1rem 0;
        color: #333;
    }

    .confirm-btn {
        background: #e9ecef;
        color: #333;
    }

    .confirm-btn:hover {
        background: #28a745;
        color: white;
    }

    .route-totals {
        margin-left: auto;
        padding: 0.5rem 1rem;
        background: #e9ecef;
        border-radius: 4px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }
    
    .total-item {
        display: flex;
        gap: 0.5rem;
        white-space: nowrap;
    }
    
    .total-label {
        font-weight: bold;
        color: #555;
    }
    
    .total-value {
        font-weight: bold;
        color: #333;
    }
    
    @media (max-width: 768px) {
        .route-controls {
            flex-direction: column;
        }
        
        .route-totals {
            margin-left: 0;
            margin-top: 1rem;
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>