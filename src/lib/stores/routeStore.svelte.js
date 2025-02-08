import { browser } from '$app/environment';
import { nanoid } from 'nanoid';

// Initialize reactive state variables using Svelte 5 runes
let waypoints = $state([]); // Array of route waypoints
let route = $state(null); // Current calculated route
let isEditing = $state(false); // Edit mode state
let selectedWaypoint = $state(null); // Currently selected waypoint

// Load initial state from localStorage
if (browser) {
    const savedWaypoints = localStorage.getItem('waypoints');
    if (savedWaypoints) {
        waypoints = JSON.parse(savedWaypoints);
    }
}

// Enhanced store with both getters and setters
export const routeStore = {
    // Getters for accessing state
    get waypoints() { return waypoints; },
    get route() { return route; },
    get isEditing() { return isEditing; },
    get selectedWaypoint() { return selectedWaypoint; },
    
    // Setters for updating state with side effects
    set waypoints(newWaypoints) {
        waypoints = newWaypoints;
        saveWaypoints();
    },
    set route(newRoute) {
        route = newRoute;
    },
    set isEditing(value) {
        isEditing = value;
    },
    set selectedWaypoint(waypoint) {
        selectedWaypoint = waypoint;
    }
};

// Persist waypoints to localStorage
function saveWaypoints() {
    if (browser) {
        localStorage.setItem('waypoints', JSON.stringify(waypoints));
    }
}

// Add a new waypoint with unique ID
export function addWaypoint(waypoint) {
    const waypointWithId = {
        id: nanoid(),
        lat: waypoint.lat,
        lng: waypoint.lng,
        address: waypoint.address || 'Custom Location'
    };
    waypoints = [...waypoints, waypointWithId];
    console.log('Waypoint added with ID:', waypointWithId);
    saveWaypoints();
}

// Reorder waypoints for drag and drop functionality (was working but not now - need to debug this)
export function reorderWaypoints(newWaypoints) {
    waypoints = newWaypoints;
    console.log('Waypoints reordered:', JSON.stringify(waypoints));
    saveWaypoints();
}

// Update existing waypoint at specified index
export function updateWaypoint(index, waypoint) {
    waypoints = waypoints.map((w, i) => (i === index ? waypoint : w));
    console.log('Waypoint updated in store:', { index, waypoint });
    saveWaypoints();
}

// // Import route calculation service from OpenRouteService
import { OpenRouteService } from '../routeServices/openRouteService';

// Track number of waypoints for route calculation
let currentWaypointCount = 0;

// Delete waypoint and recalculate route if needed
export function deleteWaypoint(index) {
    const updatedWaypoints = waypoints.filter((_, i) => i !== index);
    waypoints = updatedWaypoints;
    currentWaypointCount = updatedWaypoints.length;
    console.log('Current waypoint count:', currentWaypointCount);
    saveWaypoints();
    
    // Recalculate route only if enough waypoints remain
    if (currentWaypointCount >= 2) {
        recalculateRoute(updatedWaypoints);
    } else {
        route = null;
    }
}

// Separate route calculation logic
async function recalculateRoute(waypointList) {
    console.log('Recalculating route with waypoints:', waypointList);
    try {
        const newRoute = await OpenRouteService.calculateRoute(waypointList);
        route = newRoute;
    } catch (error) {
        console.error('Route calculation failed:', error);
        route = null;
    }
}

// Update current route
export function setRoute(newRoute) {
    route = newRoute;
    console.log('Route set in store:', newRoute);
}

// Clear all route data and localStorage
export function clearRoute() {
    waypoints = [];
    route = null;
    if (browser) {
        localStorage.removeItem('waypoints');
    }
    console.log('Route cleared in store');
}

// Toggle editing mode
export function toggleEditing() {
    isEditing = !isEditing;
    console.log('Editing toggled in store:', isEditing);
}

// Export all route-related actions
export const routeActions = {
    addWaypoint,
    updateWaypoint,
    deleteWaypoint,
    reorderWaypoints,
    clearRoute,
    setRoute,
    toggleEditing,
    recalculateRoute
};