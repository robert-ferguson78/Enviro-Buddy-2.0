<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store'; // Import writable store
    import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
    import GalleryImages from '$lib/components/partials/GalleryImages.svelte';
    let carTypes = [];

    let map;
    let L;
    let currentMarker = null; // Add this line to keep a reference to the current marker
    let dealer = writable(null); // Make dealer a writable store
    let customIcon; // Define customIcon variable

    onMount(async () => {
        if (typeof window !== 'undefined') {
            const module = await import('leaflet');
            L = module.default;

            // Define custom icon
            customIcon = L.icon({
                iconUrl: '/images/map-car-marker.png',
                shadowUrl: '/images/map-car-marker-shadow.png',
                iconSize: [52, 60], // size of the icon
                shadowSize: [52, 60], // size of the shadow
                iconAnchor: [26, 60], // anchor at half width and full height to position the bottom center of the icon at the marker's location
                shadowAnchor: [26, 60], // anchor the shadow at the same point
                popupAnchor: [0, -60] // open the popup just above the icon
            });

            map = L.map('secondary-map', { zoomSnap: 0, doubleClickZoom: false }).setView([53.340610, -7.673507], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);
        }
    });

    // Add this reactive statement
    $: $dealer && mapActions.addMarker($dealer); // Use $dealer to access the value of the dealer store

    async function updateCarTypes() {
        carTypes = await carTypeFirestoreStore.getCarTypesByBrandId($dealer.userId); // Update carTypes when dealer changes
        console.log('carTypes for dealer', carTypes); // Log carTypes
    }

    $: if ($dealer) {
        mapActions.addMarker($dealer); // Use $dealer to access the value of the dealer store
        updateCarTypes();
    }

    export let mapActions = {
        addMarker(newDealer) {
            dealer.set(newDealer); // Update the dealer object using set method

            console.log('newDealer', newDealer);
            if (L) {
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }

                // Use customIcon when creating the marker
                currentMarker = L.marker([$dealer.latitude, $dealer.longitude], {icon: customIcon}).addTo(map); // Use $dealer to access the value of the dealer store
                map.flyTo([currentMarker.getLatLng().lat, currentMarker.getLatLng().lng], 16, { duration: 2.2 }); // Animate the transition to the new marker
            }
        }
    };
</script>

<div id="secondary-map" style="height: 150px;"></div>
<GalleryImages {carTypes} />