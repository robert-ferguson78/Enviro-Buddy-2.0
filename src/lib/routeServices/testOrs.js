import { ORSService } from './orsService';

async function testORS() {
    const orsService = new ORSService();
    const testWaypoints = [
        { lat: 49.41461, lng: 8.681495 },
        { lat: 49.420318, lng: 8.687872 }
    ];

    try {
        console.log('Testing ORS API...');
        const routeData = await orsService.getRoute(testWaypoints);
        console.log('Route Data:', routeData);
        
        console.log('Testing Geocoding...');
        const geocodeData = await orsService.geocodeAddress('Heidelberg, Germany');
        console.log('Geocode Data:', geocodeData);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testORS();