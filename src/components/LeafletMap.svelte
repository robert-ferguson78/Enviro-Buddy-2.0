<script>
import { onMount } from 'svelte';

let L;
export let setCoordinates;

let map;
let marker;
let mapContainer;
let customIcon;

onMount(async () => {
    // Dynamically import Leaflet
    L = await import('leaflet');

    // Configure custom marker icon with precise positioning
    customIcon = L.icon({
        iconUrl: '/images/map-car-marker.png',
        shadowUrl: '/images/map-car-marker-shadow.png',
        iconSize: [52, 60],
        shadowSize: [52, 60],
        iconAnchor: [26, 60],
        shadowAnchor: [26, 60],
        popupAnchor: [0, -60]
    });

    if (mapContainer) {
        // Initialize map centered on Ireland
        map = L.map(mapContainer).setView([53.551357, -7.628111], 6);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Handle double-click events
        map.on('dblclick', function(e) {
            const coord = e.latlng;
            const lat = Number(coord.lat.toFixed(7));
            const lng = Number(coord.lng.toFixed(7));

            // Remove existing marker
            if (marker) {
                map.removeLayer(marker);
            }

            // Add new marker
            marker = L.marker([lat, lng], {icon: customIcon}).addTo(map);

            // Update coordinates
            setCoordinates({ lat, lng });
        });
    }
});
</script>

<div id="map" bind:this={mapContainer}></div>
<div id="map-info" class="icon-text">
    <span class="icon has-text-info">
        <i class="fas fa-info-circle"></i>
    </span>
    <span>Double click map to populate the Geo Location co-ordinates</span>
</div>

<style>
#map {
    width: 100%;
    min-height: 350px;
    margin-bottom: 15px;
}
#map-info {
    margin-bottom: 30px;
}
</style>
