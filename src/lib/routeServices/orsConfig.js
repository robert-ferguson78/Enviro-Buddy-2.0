// Configuration for OpenRouteService API

export const orsConfig = {
    apiKey: import.meta.env.VITE_ORS_API_KEY,
    baseUrl: 'https://api.openrouteservice.org',
    endpoints: {
        directions: '/v2/directions/driving-car', // Routing endpoint
        geocoding: '/geocode/search', // Forward geocoding endpoint
        reverseGeocoding: '/geocode/reverse' // Reverse geocoding endpoint
    }
};

// console.log('API Key:', orsConfig.apiKey);