<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { routeStore, routeActions } from '../../stores/routeStore.svelte.js';

    // Destructure addWaypoint action from routeActions
    const { addWaypoint } = routeActions;

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
                    L.default.marker([point.lat, point.lng]).addTo(markerLayer);
                });
            }
        }
    });

    // Effect for waypoint updates (upate map markers)
    $effect(() => {
        if (!map || !L || !markerLayer) return;
        markerLayer.clearLayers();
        waypoints.forEach(point => {
            L.default.marker([point.lat, point.lng]).addTo(markerLayer);
        });
    });

    // Effect for route updates (was wokring but not working now - need to debug again)
    $effect(() => {
        if (!map || !L || !currentRoute?.routes?.[0]?.geometry) return;
        // Check for change
        const newGeometry = JSON.stringify(currentRoute.routes[0].geometry);
        if (newGeometry === routeGeometry) return;
        
        routeGeometry = newGeometry;
        // Remove previous route
        if (routeLayer) {
            routeLayer.remove();
        }

        // Convert coordinates and draw new route
        const coordinates = currentRoute.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        routeLayer = L.default.polyline(coordinates, { color: '#007bff' }).addTo(map);

        // Adjust map view to show entire route
        const bounds = L.default.latLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [50, 50] });
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
</style>