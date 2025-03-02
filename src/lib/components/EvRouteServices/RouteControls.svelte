<script>
    import { routeStore, routeActions } from '../../stores/routeStore.svelte.js';
    import { OpenRouteService } from '$lib/routeServices/openRouteService';

    // Update props to match parent component
    let { activeRouteData, activeDay, setRoute, toggleEditing, handleClearRoute, isEditing, totalWeeklyDistance } = $props();

    // State for confirmation dialog using Svelte 5 runes
    let showConfirmClear = $state(false);

    // Calculate route using activeRouteData
    async function calculateRoute() {
        if (activeRouteData.waypoints.length >= 2) {
            const result = await OpenRouteService.calculateRoute(activeRouteData.waypoints);
            setRoute(result);
        }
    }
    // Show confirmation dialog for route clearing
    function confirmClear() {
        showConfirmClear = true;
    }

    // Hide confirmation dialog
    function cancelClear() {
        showConfirmClear = false;
    }

    // Clear route and hide confirmation dialog
    function clearRoute() {
        handleClearRoute();
        showConfirmClear = false;
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

    <div class="total-distance">
        Total Weekly Distance: {totalWeeklyDistance} km
    </div>

    {#if showConfirmClear}
        <div class="confirm-dialog">
            <p>Are you sure you want to clear the route?</p>
            <button class="confirm-btn" onclick={clearRoute}>Yes</button>
            <button class= "clear-btn" onclick={cancelClear}>No</button>
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

    .total-distance {
        margin-left: auto;
        padding: 0.5rem;
        background: #e9ecef;
        border-radius: 4px;
        font-weight: bold;
    }
</style>