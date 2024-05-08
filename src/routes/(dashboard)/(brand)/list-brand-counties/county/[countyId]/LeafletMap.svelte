<script>
    import { onMount } from 'svelte';
    let L;

    export let setCoordinates = () => {};

    let map;
    let marker; // Keep a reference to the last marker added
    let mapContainer; // Reference to the map div

    onMount(async () => {
        L = await import('leaflet');

        if (mapContainer) {
            map = L.map(mapContainer).setView([53.551357, -7.628111], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            map.on('dblclick', function(e) {
                var coord = e.latlng;
                var lat = Number(coord.lat.toFixed(7)); // Limit to 7 decimal places
                var lng = Number(coord.lng.toFixed(7)); // Limit to 7 decimal places

                // If a marker already exists, remove it from the map
                if (marker) {
                    map.removeLayer(marker);
                }

                // Add a new marker and keep a reference to it
                marker = L.marker([lat, lng]).addTo(map);

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