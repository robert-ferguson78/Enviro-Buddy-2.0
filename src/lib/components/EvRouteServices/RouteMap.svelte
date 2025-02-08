<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { routeStore, routeActions } from '../../stores/routeStore.svelte.js';
    import { decode } from '@mapbox/polyline';

    // Destructure addWaypoint action from routeActions
    const { addWaypoint, updateWaypoint, recalculateRoute } = routeActions;

    // Initialize reactive state variables using Svelte 5 runes
    let map = $state(null);
    let routeLayer = $state(null);
    let markerLayer = $state(null);
    let L = $state(null);
    let routeGeometry = $state(null);

    // Create derived values from the route store
    let waypoints = $derived(routeStore.waypoints);
    let currentRoute = $derived(routeStore.route);

    // Initialize the Leaflet map with default settings (note to self default map ziew and zoom need to change)
    function initializeMap() {
        // Create map centered on specific coordinates (make these dynamic)
        map = L.default.map('route-map').setView([49.41461, 8.681495], 13);
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        markerLayer = L.default.layerGroup().addTo(map);
        
        // Add waypoints from map
        map.on('click', (event) => {
            const { lat, lng } = event.latlng;
            addWaypoint({ lat, lng });
        });
    }

    // Load Leaflet library on mount
    onMount(async () => {
        if (browser) {
            // Import Leaflet library dynamically
            L = await import('leaflet');
            initializeMap();
            // Add waypoints already created to map
            if (waypoints.length > 0) {
                waypoints.forEach(point => {
                    const marker = L.default.marker([point.lat, point.lng], { draggable: true }).addTo(markerLayer);
                    marker.on('dragend', (event) => {
                    const newPosition = event.target.getLatLng();
                    updateWaypoint(waypoints.indexOf(point), {
                        lat: newPosition.lat,
                        lng: newPosition.lng
                        });
                    });
                });
            }
        }
    });

    // Effect for waypoint updates (upate map markers)
    $effect(() => {
        if (!map || !L || !markerLayer) return;
        markerLayer.clearLayers();
        
        waypoints.forEach((point, index) => {
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
                updateWaypoint(index, {
                    lat: newPosition.lat,
                    lng: newPosition.lng
                });
                
                // re-calculate dragged marker route with more than minimum waypoints
                if (waypoints.length >= 2) {
                    await recalculateRoute(waypoints);
                }
            });
        });
    });

    $effect(() => {
        // Clear route if less than 2 waypoints
        if (waypoints.length < 2) {
            if (routeLayer) {
                routeLayer.remove();
                routeLayer = null;
            }
            return;
        }

        if (!map || !L || !currentRoute?.geometry) return;

        // Track both geometry and number of waypoints
        const currentGeometry = currentRoute.geometry.coordinates;
        const waypointCount = waypoints.length;

        // Update when waypoints or the route geometry changes
        const newState = `${currentGeometry}-${waypointCount}`;
        if (newState === routeGeometry) return;
        routeGeometry = newState;
    
        // Remove previous route
        if (routeLayer) {
            routeLayer.remove();
        }

        // Decode the polyline string and convert to Leaflet coordinates
        const decodedCoordinates = decode(currentGeometry);
        const coordinates = decodedCoordinates.map(point => [point[0], point[1]]);

        routeLayer = L.default.polyline(coordinates, {
            color: '#007bff',
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round'
        }).addTo(map);

        // Center and Zoom map with coordinates
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