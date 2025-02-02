// Configuration for OpenRouteService API

export const orsConfig = {
    apiKey: import.meta.env.VITE_ORS_API_KEY,
    baseUrl: 'https://api.openrouteservice.org',
    endpoints: {
        directions: '/v2/directions/driving-car',
        geocoding: '/geocode/search'
    }
};

// console.log('API Key:', orsConfig.apiKey);