const ORS_API_URL = 'https://api.openrouteservice.org/v2/directions/driving-car'; // API endpoint for driving directions on OpenRouteService
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

export class OpenRouteService {
    /**
     * Calculates a route between provided waypoints using OpenRouteService API
     * @param {Array} waypoints - Array of waypoint objects containing lat/lng coordinates
     * @returns {Object} Formatted route data including distance, duration and geometry
     */
    static async calculateRoute(waypoints) {
        // need 2 waypoints to calculate a route
        if (waypoints.length < 2) {
            throw new Error('At least 2 waypoints are required');
        }
    
        try {
            // Convert waypoints to [longitude, latitude] format required by the API
            const coordinates = waypoints.map(point => [point.lng, point.lat]);
            console.log('Sending coordinates to OpenRouteService:', coordinates);
    
            // API request to OpenRouteService
            const response = await fetch(ORS_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': ORS_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coordinates,
                    instructions: true, // Include turn-by-turn instructions
                    geometry: true, // Include route geometry
                    radiuses: coordinates.map(() => 1000) // default is 350m so i increased it to 1000m to the nearest road for routing
                }),
            });
    
            // for API errors :(
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error.message}`);
            }
    
            const data = await response.json();
            console.log('API response:', data);
            return this.formatRouteResponse(data);
        } catch (error) {
            console.error('OpenRouteService error:', error);
            throw error;
        }
    }

    /**
     * Formats the raw API response into a more usable structure
     * @param {Object} data - Raw API response data
     * @returns {Object} Formatted route data
     */
    static formatRouteResponse(data) {
        // Validate response
        if (!data.routes || !data.routes[0]) {
            throw new Error('Invalid route data: missing routes');
        }
    
        const route = data.routes[0];
        const distanceInKm = route.summary.distance / 1000; // Convert meters to kilometers
        const durationInMinutes = Math.round(route.summary.duration / 60); // Convert duration to minutes
    
        // debugging actual values to convert
        console.log('Route Calculations:', {
            distanceKm: `${distanceInKm.toFixed(2)} km`,
            durationMinutes: `${durationInMinutes} minutes`,
            rawDistance: route.summary.distance,
            rawDuration: route.summary.duration
        });

        // Put data in a const so i can console log it
        const formattedRoute = {
            geometry: {
                coordinates: route.geometry
            },
            distanceKm: `${distanceInKm.toFixed(2)}`,
            durationMinutes: `${durationInMinutes}`,
            segments: route.segments
        };
    
        console.log('Formatted route data:', formattedRoute);
        return formattedRoute;
    }
}