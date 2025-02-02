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
}