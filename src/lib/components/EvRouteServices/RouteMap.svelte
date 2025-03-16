<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { routeStore, routeActions } from '../../stores/routeStore.svelte.js';
    import { decode } from '@mapbox/polyline';
    // reverse geocoding for co-ordinates to get address
    import { ORSService } from '$lib/routeServices/orsService';
    import { orsConfig } from '$lib/routeServices/orsConfig';
    import { OpenRouteService } from '$lib/routeServices/openRouteService';
    import { messageActions } from '$lib/stores/messages.store.svelte'; // display error messages

    // route layers for each day
    let routeLayers = $state({});

    const orsService = new ORSService(orsConfig.apiKey);

    // Destructure addWaypoint action from routeActions
    const { addWaypoint, updateWaypoint, recalculateRoute } = routeActions;

    // Initialize reactive state variables using Svelte 5 runes
    let map = $state(null);
    let routeLayer = $state(null);
    let markerLayer = $state(null);
    let L = $state(null);
    let routeGeometry = $state(null);
    // Update props to use only what's needed from parent
    let { activeRouteData, activeDay, routes } = $props();

    // update route changes with derived values
    let currentRoute = $derived(activeRouteData.route);
    let waypoints = $derived(activeRouteData.waypoints);
    // Initialize the Leaflet map with default settings (note to self default map ziew and zoom need to change)
    function initializeMap() {
        // Create map centered on specific coordinates (make these dynamic)
        map = L.default.map('route-map').setView([53.427977, -7.940325], 7);
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        markerLayer = L.default.layerGroup().addTo(map);
        
        // Add waypoints from map
        map.on('click', async (event) => {
            const { lat, lng } = event.latlng;
            try {
                // Use reverse geocoding to get address
                const result = await orsService.reverseGeocode(lat, lng);
                addWaypoint({
                    lat,
                    lng,
                    address: result.properties.label
                });
            } catch (error) {
                addWaypoint({ 
                    lat, 
                    lng, 
                    address: 'Custom Location' 
                });
            }
        });
    }

    // Load Leaflet library on mount
    onMount(async () => {
        if (browser) {
            // Import Leaflet library dynamically
            L = await import('leaflet');
            initializeMap();
            // Add waypoints already created to map
            if (activeRouteData.waypoints.length > 0) {
                activeRouteData.waypoints.forEach(point => {
                    const marker = L.default.marker([point.lat, point.lng], { draggable: true }).addTo(markerLayer);
                    marker.on('dragend', (event) => {
                    const newPosition = event.target.getLatLng();
                    updateWaypoint(activeRouteData.waypoints.indexOf(point), {
                        lat: newPosition.lat,
                        lng: newPosition.lng
                        });
                    });
                });
            }
        }
    });

    // Effect for waypoint updates (update map markers)
    $effect(() => {
        if (!map || !L || !markerLayer) return;
        markerLayer.clearLayers();
        
        activeRouteData.waypoints.forEach((point, index) => {
            // Create custom numbered icon
            const numberIcon = L.default.divIcon({
                className: 'custom-marker-icon',
                html: `<div class="marker-number">${index + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            // Added draggable property and drag end event handler
            const marker = L.default.marker([point.lat, point.lng], { 
                icon: numberIcon,
                draggable: true 
            }).addTo(markerLayer);

            // Drag end event handler for updated markers
            marker.on('dragend', async (event) => {
                const newPosition = event.target.getLatLng();
                console.log('Marker dragged to position:', newPosition);
                
                let updatedWaypoint = {
                    lat: newPosition.lat,
                    lng: newPosition.lng,
                    address: point.address || 'Custom Location',
                    id: point.id
                };
                
                try {
                    // get address from reverse geocoding
                    const result = await orsService.reverseGeocode(newPosition.lat, newPosition.lng);
                    console.log('Geocoding result:', result);
                    
                    updatedWaypoint.address = result.properties.label;
                    console.log('Updating waypoint with:', updatedWaypoint);
                    
                    // Single update with all data
                    updateWaypoint(index, updatedWaypoint);
                } catch (error) {
                    console.log('Geocoding error:', error);
                    
                    updateWaypoint(index, updatedWaypoint);
                    
                    messageActions.showError('Could not get address for this location. The waypoint has been updated with coordinates only.');
                }
            });
        });
    });

    // Track route changes with derived values
    let activeRoute = $derived(routeStore.routes[activeDay].route);
    // Track previous state to prevent unnecessary updates
    let routeState = $state({
        geometry: null,
        activeDay: null
    });

    $effect(() => {
        // Clear ALL route layers when switching days or when no route exists
        if (!activeRouteData.route?.geometry || !map || !L) {
            Object.values(routeLayers).forEach(layer => layer?.remove());
            return;
        }

        // Clear all routes firt
        const currentGeometry = activeRouteData.route.geometry.coordinates;
        
        // Only update if geometry or active day has changed
        const newState = {
            geometry: JSON.stringify(currentGeometry),
            activeDay
        };
        
        if (JSON.stringify(routeState) === JSON.stringify(newState)) return;
        routeState = newState;

        // Clear ALL route layers
        Object.values(routeLayers).forEach(layer => layer?.remove());
        
         // Draw only the active day's route
        const decodedCoordinates = decode(currentGeometry);
        const coordinates = decodedCoordinates.map(point => [point[0], point[1]]);

        routeLayers[activeDay] = L.default.polyline(coordinates, {
            color: routes[activeDay].color,
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round'
        }).addTo(map);

        // Center map on current route
        if (coordinates.length > 0) {
            const bounds = L.default.latLngBounds(coordinates);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    });
    // cleanup on destroy
    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });
</script>

<div id="route-map" class="map-container"></div>

<style>
    .map-container {
        width: 100%;
        height: 500px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    #route-map {
        margin-bottom: 0;
    }
</style>