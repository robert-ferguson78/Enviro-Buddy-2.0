<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    // Props - add dealers prop
    const { setCoordinates, dealers = [] } = $props();

    // State variables
    let L = $state(null);
    let map = $state(null);
    let marker = $state(null); // Keep a reference to the last marker added for new dealer
    let dealerMarkers = $state([]); // Array to store markers for existing dealers
    let mapContainer = $state(null); // Reference to the map div
    let customIcon = $state(null); // Custom icon for the marker
    let markersAdded = $state(false); // Flag to track if markers have been added
    let currentDealersHash = $state(''); // Hash to detect changes in the dealers array

    // Initialize map on mount
    onMount(async () => {
    if (!browser) return;
    
    try {
        // Import Leaflet
        const module = await import('leaflet');
        L = module.default;
        
        // Define custom icon
        customIcon = L.icon({
            iconUrl: '/images/map-car-marker.png',
            shadowUrl: '/images/map-car-marker-shadow.png',
            iconSize: [52, 60], // size of the icon
            shadowSize: [52, 60], // size of the shadow
            iconAnchor: [26, 60], // anchor at half width and full height
            shadowAnchor: [26, 60], // anchor the shadow at the same point
            popupAnchor: [0, -60] // open the popup just above the icon
        });
        
        if (mapContainer) {
        // Initialize map centered on Ireland
        map = L.map(mapContainer).setView([53.551357, -7.628111], 6);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);
        
        // Add double-click event handler
        map.on('dblclick', function(e) {
            const coord = e.latlng;
            const lat = Number(coord.lat.toFixed(7)); // Limit to 7 decimal places
            const lng = Number(coord.lng.toFixed(7)); // Limit to 7 decimal places
            
            // If a marker already exists, remove it from the map
            if (marker) {
            map.removeLayer(marker);
            }
            
            // Add a new marker with custom icon and keep a reference to it
            marker = L.marker([lat, lng], {icon: customIcon}).addTo(map);
            
            // Call the setCoordinates function passed as a prop
            setCoordinates({ lat, lng });
        });
        
            // Add markers for existing dealers from the dealers prop
            addDealerMarkers();
        }
    } catch (error) {
        console.error('Error initializing map:', error);
    }
    });

    // Clean up resources when component is destroyed
    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });

    /**
     * Generate a unique hash from the dealers array to detect changes
     * This prevents unnecessary re-rendering of markers when the dealers array hasn't changed
     */
    function getDealersHash(dealersArray) {
        return dealersArray
            .map(d => `${d._id}-${d.latitude}-${d.longitude}`) // Create a string for each dealer
            .sort() // Sort for consistent order
            .join('|'); // Join into a single string
    }

    /**
     * Function to add markers for existing dealers
     * This function handles:
     * 1. Checking if the dealers array has changed
     * 2. Clearing existing markers
     * 3. Adding new markers for each dealer
     * 4. Fitting the map bounds to show all markers
     */
    function addDealerMarkers() {
        // Skip if map or required components aren't initialized or no dealers exist
        if (!map || !L || !customIcon || !dealers || !dealers.length) return;

        // Generate a hash of the current dealers array (prevets infinite loop i encountred)
        const newHash = getDealersHash(dealers);

        // Only update if the dealers have changed
        if (newHash === currentDealersHash) return;
        currentDealersHash = newHash;
        
        // Clear existing markers instead of keeping track of each marker individually
        map.eachLayer(layer => {
            if (layer instanceof L.Marker && layer !== marker) {
            map.removeLayer(layer);
            }
        });
        
        // Create bounds object to fit all markers in view
        const bounds = L.latLngBounds();
        let markersCount = 0;
        
        // Add markers for each dealer with valid coordinates
        dealers.forEach(dealer => {
            if (dealer.latitude && dealer.longitude) {
                try {
                    const dealerMarker = L.marker([dealer.latitude, dealer.longitude], {
                    icon: customIcon
                    }).addTo(map);
                    
                    // Add popup with dealer info
                    dealerMarker.bindPopup(`
                    <strong>${dealer.name || 'Unnamed Dealer'}</strong><br>
                    ${dealer.address || ''}<br>
                    ${dealer.phone || ''}<br>
                    ${dealer.email || ''}
                    `);
                    
                    // Extend the bounds to include this marker
                    bounds.extend([dealer.latitude, dealer.longitude]);
                    markersCount++;
                } catch (error) {
                    console.error('Error adding marker for dealer:', dealer, error);
                }
            }
        });

        // If we have markers, fit the map to show all of them
        if (markersCount > 0) {
            try {
            map.fitBounds(bounds.pad(0.1));
            } catch (error) {
            console.error('Error fitting bounds:', error);
            }
        }
        
        // Set flag indicating markers have been added
        markersAdded = true;
    }

    // Watch for changes to dealers array or map initialization
    // This effect ensures markers are updated when dealers change
    $effect(() => {
        if (map && L && customIcon && dealers) {
            // Use setTimeout to break the reactive chain
            setTimeout(() => {
            addDealerMarkers();
            }, 0);
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