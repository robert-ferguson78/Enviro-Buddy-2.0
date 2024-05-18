<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';
    import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
    import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
    import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
    import SecondaryMainMap from '$lib/components/partials/SecondaryMainMap.svelte';
    import type { carType } from '$lib/types/enviro-buddy-types';

    let secondaryMapActions;
    let button;
    let lastOpenedPopupDealer = null;
    let isPopupOpen = false;
    let currentButton = null;
    let customIcon;
    let customShadow;

    let map;
    let L;
    let dealers;
    let dealer;
    let countyIdToName = {};
    let users;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            const module = await import('leaflet');
            L = module.default;

            // Dynamically import the 'leaflet-groupedlayercontrol' library
            await import('leaflet-groupedlayercontrol');
            
            // Define custom icon and shadow
            customIcon = L.icon({
                iconUrl: '/images/map-car-marker.png',
                shadowUrl: '/images/map-car-marker-shadow.png',
                iconSize: [52, 60], // size of the icon
                shadowSize: [52, 60], // size of the shadow
                iconAnchor: [26, 60], // anchor at half width and full height to position the bottom center of the icon at the marker's location
                shadowAnchor: [26, 60], // anchor the shadow at the same point
                popupAnchor: [0, -60] // open the popup just above the icon
            });

            // Create a map
            map = L.map('map', { zoomSnap: 0, doubleClickZoom: false }).setView([53.340610, -7.673507], 7.1);
        
            // Add a tile layer to the map
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);
    
            // Fetch all counties from Firestore
            const counties: any = await countyFirestoreStore.getAllCounties();
        
            // Create a mapping from countyId to county
            for (const county of counties) {
                countyIdToName[county._id] = county.county;
            }
        
            // Fetch all dealers from Firestore
            dealers = await dealerFirestoreStore.getAllDealers();
            // console.log('Dealers:', dealers);
        
            // Create an object to store the layers for each county
            const countyLayers = {};
        
            // Loop through the counties
            for (const county of counties) {
                // Create a layer for this county
                countyLayers[county.county] = L.layerGroup();
            }
        
            // Fetch all users from Firestore
            users = await userFirestoreStore.getAllUsers();

            // Create an object to store the layers for each brand
            const brandLayers = {};

            // Fetch all car types from Firestore
            const carTypes: any = await carTypeFirestoreStore.findCarType();

            // Create a mapping from userId to car types
            let userIdToCarTypes = {};
            for (const carType of carTypes) {
                if (!userIdToCarTypes[carType.userId]) {
                    userIdToCarTypes[carType.userId] = [];
                }
                userIdToCarTypes[carType.userId].push(carType);
            }

            // Loop through the dealers
            for (const dealer of dealers) {
                // console.log('Dealer:', dealer);
                // Get the county name from the dealer's countyId
                const countyName = countyIdToName[dealer.countyId];
                // Find the user associated with the dealer
                const user = users.find(user => user.user_id === dealer.userId);
                // If a matching user is found and it has valid latitude and longitude
                if (user && dealer.latitude !== undefined && dealer.longitude !== undefined) {
                    // Create a marker for the dealer with custom map marker
                    const marker = L.marker([dealer.latitude, dealer.longitude], {icon: customIcon});

                    // Find the car types associated with the dealer
                    const dealerCarTypes = userIdToCarTypes[dealer.userId] || [];

                    // Create popup
                    let popupHtml = `
                        <strong>Brand:</strong> ${user.brand}<br>
                        <strong>Dealer Name:</strong> ${dealer.name}<br>
                        <strong>Contact Number:</strong> ${dealer.contactNumber}<br>
                        <strong>Email:</strong> ${dealer.email}<br>
                        <strong>Phone Number:</strong> ${dealer.phoneNumber}<br>
                        <strong>Website:</strong> <a href="${dealer.website}" target="_blank">${dealer.website}</a>
                    `;

                    popupHtml += `<div class="columns is-multiline car-type-popup">`;

                    // Add car types to the popup
                    for (const carType of dealerCarTypes) {
                        popupHtml += `<div class="column is-4">
                            <strong>${carType.carType}</strong> <br>
                            <img src="${carType.image}" alt="${carType.carType}"></div>`;
                    }

                    popupHtml += `</div>`;

                    // Bind the popup to the marker
                    marker.bindPopup(popupHtml);

                    marker.on('popupopen', function(e) {
                        isPopupOpen = true;

                        // Add the marker to the secondary map when the popup opens
                        secondaryMapActions.addMarker(dealer);

                        let btn = document.getElementById(`btn-${dealer.id}`);
                        if (btn) {
                            // Remove the click event listener from the current button
                            if (currentButton) {
                                currentButton.removeEventListener('click', currentButton.clickEvent);
                            }

                            // Assign the new button to the current button
                            currentButton = btn;

                            // Store the click event in a variable
                            currentButton.clickEvent = function() {
                                // Add the marker to the secondary map when the button is clicked
                                secondaryMapActions.addMarker(dealer);
                            };

                            // Add the click event listener to the current button
                            currentButton.addEventListener('click', currentButton.clickEvent);
                        }
                    });

// Store the dealer of the last opened popup
lastOpenedPopupDealer = dealer;

                    // Check if the county layer exists
                    if (countyLayers[countyName]) {
                        // Add the marker to the appropriate county layer
                        marker.addTo(countyLayers[countyName]);
                        // Mark the county layer as having a dealer
                        countyLayers[countyName].hasDealer = true;
                    } else {
                        console.log('No layer for countyId:', dealer.countyId);
                    }
                    // Check if the user's type is 'brand'
                    if (user.type === 'brand') {
                        // If the brand layer doesn't exist, create it
                        if (!brandLayers[user.brand]) {
                            // console.log('Dealer:', dealer);
                            brandLayers[user.brand] = L.layerGroup();
                            // console.log('Created layer group for brand:', user.brand, brandLayers[user.brand]);
                        }
                        // Add the marker to the appropriate brand layer
                        if (brandLayers[user.brand] && brandLayers[user.brand] instanceof L.Layer) {
                            // console.log('Adding marker for dealer with countyId:', dealer.countyId);
                            // Add the layer to the map
                            marker.addTo(brandLayers[user.brand]);
                            // console.log('Added marker to brand layer:', user.brand);
                        }
                    }
                }

                // Add the brand layers to the map
                for (const brand in brandLayers) {
                    brandLayers[brand].addTo(map);
                }

                // Add the county layers to the map
                for (const county in countyLayers) {
                    // Only add the county layer if it has a dealer
                    if (countyLayers[county].hasDealer) {
                        countyLayers[county].addTo(map);
                    }
                }
            }
            // Create an object to store the grouped layers
        let groupedLayers = {
            "Brands": {},
            "Counties": {}
        };

        // Loop through the brand layers and add them to the grouped layers
        for (const brand in brandLayers) {
            groupedLayers["Brands"][brand] = brandLayers[brand];
        }

        // Loop through the county layers and add them to the grouped layers
        for (const county in countyLayers) {
            // Only add the county layer to the grouped layers if it has a dealer
            if (countyLayers[county].hasDealer) {
                groupedLayers["Counties"][county] = countyLayers[county];
            }
        }

        // Create a layer control and add it to the map
        L.control.groupedLayers(null, groupedLayers).addTo(map);
        }
    });

    afterUpdate(() => {
        if (button) {
            button.addEventListener('click', function() {
                secondaryMapActions.addMarker(dealer);
            });
        }
    });
</script>

<svelte:head>
    <link rel="stylesheet" href="/node_modules/leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css">
</svelte:head>

<style>
    #map {
        height: 700px; /* Set the height of the map container */
        width: 100%;
    }
</style>

<div class="column is-three-fifths">  
    <div id="map"></div>
</div>
<div class="column">
    <SecondaryMainMap bind:mapActions={secondaryMapActions} />
</div>