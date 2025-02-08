import { orsConfig } from './orsConfig';

class APIError extends Error {
    constructor(message, statusCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'APIError';
    }
}

export class ORSService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = orsConfig.baseUrl;
    }

    async geocodeAddress(address) {
        try {
            const encodedAddress = encodeURIComponent(address);
            const url = `${this.baseUrl}${orsConfig.endpoints.geocoding}?text=${encodedAddress}`;
            
            // Make API request with authentication and JSON acceptance headers
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new APIError(
                    data.error?.message || 'Geocoding failed',
                    response.status,
                    data.error
                );
            }

            // Process the successful response
            if (data.features && data.features.length > 0) {
                const location = data.features[0];
                return {
                    coordinates: location.geometry.coordinates,
                    properties: {
                        name: location.properties.name,
                        country: location.properties.country,
                        region: location.properties.region,
                        confidence: location.properties.confidence,
                        label: location.properties.label
                    }
                };
            } else {
                throw new APIError('No results found', 404);
            }
        } catch (error) {
            console.error('Geocoding Error:', error);
            throw new APIError(
                error.message || 'Failed to geocode address',
                error.status || 500
            );
        }
    }

    // Method to convert coordinates into address
    async reverseGeocode(lat, lng) {
        try {
            // Construct the URL for the reverse geocoding using reverseGeocoding endpoint
            const url = `${this.baseUrl}${orsConfig.endpoints.reverseGeocoding}?point.lat=${lat}&point.lon=${lng}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            // Parse the JSON response
            const data = await response.json();

            // Check if the request was successful
            if (!response.ok) {
                throw new APIError(
                    data.error?.message || 'Reverse geocoding failed',
                    response.status,
                    data.error
                );
            }

            // Check if we got any results back
            if (data.features && data.features.length > 0) {
                const location = data.features[0];
                
                // Format and return the location data
                return {
                    coordinates: location.geometry.coordinates,
                    properties: {
                        name: location.properties.name,
                        country: location.properties.country,
                        region: location.properties.region,
                        confidence: location.properties.confidence,
                        label: location.properties.label
                    }
                };
            } else {
                // Throw error if no locations were found
                throw new APIError('No results found', 404);
            }
        } catch (error) {
            // Log and rethrow any errors that occur
            console.error('Reverse Geocoding Error:', error);
            throw new APIError(
                error.message || 'Failed to reverse geocode coordinates',
                error.status || 500
            );
        }
    }
}