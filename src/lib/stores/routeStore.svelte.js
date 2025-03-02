import { browser } from '$app/environment';
import { nanoid } from 'nanoid';

// define the default route structure
const defaultRoutes = {
    monday: { waypoints: [], route: null, color: '#007bff' },
    tuesday: { waypoints: [], route: null, color: '#800080' },
    wednesday: { waypoints: [], route: null, color: '#8B4513' },
    thursday: { waypoints: [], route: null, color: '#FFD700' },
    friday: { waypoints: [], route: null, color: '#FFA500' },
    saturday: { waypoints: [], route: null, color: '#FFC0CB' },
    sunday: { waypoints: [], route: null, color: '#FF0000' }
};

// Initialize with default values
let routes = $state(defaultRoutes);

let activeDay = $state('monday');
let isEditing = $state(false); // Edit mode state
let selectedWaypoint = $state(null); // Currently selected waypoint

// Load initial state from localStorage
if (browser) {
    const savedData = localStorage.getItem('routes');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Merge saved data with default structure to preserve colors
        routes = Object.keys(defaultRoutes).reduce((acc, day) => ({
            ...acc,
            [day]: {
                ...defaultRoutes[day],
                ...(parsedData.routes[day] || {})
            }
        }), {});
        activeDay = parsedData.activeDay || 'monday';
    }
}

// Enhanced store with both getters and setters
export const routeStore = {
    get routes() { return routes; },
    get activeDay() { return activeDay; },
    get isEditing() { return isEditing; },
    get selectedWaypoint() { return selectedWaypoint; },
    get totalWeeklyDistance() { 
        // Calculate from routes
        return calculateTotalWeeklyDistance(); 
    },
    get totalWeeklyDuration() {
        // Calculate from routes
        return calculateTotalWeeklyDuration();
    },
    set activeDay(day) { activeDay = day; },
    set isEditing(value) {
        isEditing = value;
    },
    set selectedWaypoint(waypoint) {
        selectedWaypoint = waypoint;
    }
};

// Calculate total distance for the week
function calculateTotalWeeklyDistance() {
    // Add up the distances for all days
    const total = Object.values(routes).reduce((sum, dayRoute) => {
        // Check if a route exists for day
        if (dayRoute.route) {
            // Convert to number and default to 0 if undefined
            return sum + parseFloat(dayRoute.route.distanceKm || 0);
        }
        // If there is no route for day then just return the distance
        return sum;
    }, 0);
    
    // Number 2 decimal places
    const formattedTotal = parseFloat(total.toFixed(2));
    console.log('Total Weekly Distance:', formattedTotal, 'km');
    return formattedTotal;
}

// This is a duplicate of the above function but for duration
function calculateTotalWeeklyDuration() {
    const total = Object.values(routes).reduce((sum, dayRoute) => {
        // Only add to total if the day has a calculated route
        if (dayRoute.route) {
            // Extract the duration value, convert to number, default to 0 if undefined
            return sum + parseInt(dayRoute.route.durationMinutes || 0);
        }
        // If no route for this day, just return current sum unchanged
        return sum;
    }, 0);
    
    // Log for debugging purposes
    console.log('Total Weekly Duration:', total, 'minutes');
    
    return total;
}

// Persist waypoints to localStorage
function saveWaypoints() {
    if (browser) {
        const dataToSave = {
            routes: routes,
            activeDay: activeDay
        };
        localStorage.setItem('routes', JSON.stringify(dataToSave));
        
        // Debug why reload does not diaplay lateste saved data
        // console.log('Saving to localStorage:', {
        //     savedData: JSON.parse(localStorage.getItem('routes')),
        //     currentRoutes: routes,
        //     currentActiveDay: activeDay
        // });
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
    routes[activeDay].waypoints = [...routes[activeDay].waypoints, waypointWithId];
    // console.log('Waypoint added with ID:', waypointWithId);
    saveWaypoints();
}

// Reorder waypoints for drag and drop functionality (was working but not now - need to debug this)
export function reorderWaypoints(newWaypoints) {
    routes[activeDay].waypoints = newWaypoints;

    // Recalculate route with new waypoint order
    if (newWaypoints.length >= 2) {
        OpenRouteService.calculateRoute(newWaypoints)
            .then(newRoute => {
                routes[activeDay].route = newRoute;
                // Save both waypoints and route after reordering
                saveWaypoints();
            });
            // console.log('Waypoints reordered:', JSON.stringify(routes[activeDay].waypoints));
    } else {
        // Save just the waypoints if we don't have enough for a route
        saveWaypoints();
    }
}

// Update existing waypoint at specified index
export function updateWaypoint(index, waypoint) {
    // Preserve existing waypoint ID if it exists
    const existingWaypoint = routes[activeDay].waypoints[index];
    const updatedWaypoint = {
        id: existingWaypoint?.id || nanoid(),
        ...waypoint
    };
    
    routes[activeDay].waypoints = routes[activeDay].waypoints.map((w, i) => 
        i === index ? updatedWaypoint : w
    );
    
    saveWaypoints();

    // Recalculate and save route if we have enough waypoints
    if (routes[activeDay].waypoints.length >= 2) {
        OpenRouteService.calculateRoute(routes[activeDay].waypoints)
            .then(newRoute => {
                routes[activeDay].route = newRoute;
                // Save updated route data
                saveWaypoints();
            });
    }
}

// // Import route calculation service from OpenRouteService
import { OpenRouteService } from '../routeServices/openRouteService';

// Delete waypoint and recalculate route if needed
export function deleteWaypoint(index) {
    const updatedWaypoints = routes[activeDay].waypoints.filter((_, i) => i !== index);
    routes[activeDay].waypoints = updatedWaypoints;
    // console.log('Current waypoint count:', updatedWaypoints);
    
    // Recalculate route only if enough waypoints remain
    if (updatedWaypoints.length >= 2) {
        OpenRouteService.calculateRoute(updatedWaypoints)
            .then(newRoute => {
                routes[activeDay].route = newRoute;
                saveWaypoints(); // Save after route is updated
            })
            .catch(error => {
                console.error('Route calculation failed:', error);
                routes[activeDay].route = null;
                saveWaypoints();
            });
    } else {
        // Clear route and save immediately if we don't have enough waypoints
        routes[activeDay].route = null;
        saveWaypoints();
    }
    
    // console.log('After deletion - Current route:', routes[activeDay].route);
}

// Separate route calculation logic
async function recalculateRoute(waypointList) {
    // console.log('Recalculating route with waypoints:', waypointList);
    try {
        const newRoute = await OpenRouteService.calculateRoute(waypointList);
        routes[activeDay].route = newRoute;
    } catch (error) {
        console.error('Route calculation failed:', error);
        routes[activeDay].route = null;
    }
}

// Update current route
export function setRoute(newRoute) {
    routes[activeDay].route = newRoute;
    // console.log('Route set in store:', newRoute);
}

// Clear all route data and localStorage
export function clearRoute() {
    routes[activeDay].waypoints = [];
    routes[activeDay].route = null;
    if (browser) {
        localStorage.removeItem('routes');
    }
    // console.log('Route cleared in store');
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