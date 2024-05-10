<script>
        import { onMount } from 'svelte';
        import { writable } from 'svelte/store'; // Import writable store
    
        let map;
        let L;
        let currentMarker = null; // Add this line to keep a reference to the current marker
        let dealer = writable(null); // Make dealer a writable store
    
        onMount(async () => {
            if (typeof window !== 'undefined') {
                const module = await import('leaflet');
                L = module.default;
    
                map = L.map('secondary-map', { zoomSnap: 0, doubleClickZoom: false }).setView([53.340610, -7.673507], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                }).addTo(map);
            }
        });
    
        // Add this reactive statement
        $: $dealer && mapActions.addMarker($dealer); // Use $dealer to access the value of the dealer store
    
        export let mapActions = {
            addMarker(newDealer) {
                dealer.set(newDealer); // Update the dealer object using set method
    
                if (L) {
                    if (currentMarker) {
                        map.removeLayer(currentMarker);
                    }
    
                    currentMarker = L.marker([$dealer.latitude, $dealer.longitude]).addTo(map); // Use $dealer to access the value of the dealer store
                    map.flyTo([currentMarker.getLatLng().lat, currentMarker.getLatLng().lng], 16); // Animate the transition to the new marker
                }
            }
        };
</script>
    
<div id="secondary-map" style="height: 600px;"></div>