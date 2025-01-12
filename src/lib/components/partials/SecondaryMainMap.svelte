<script>
    import { onMount } from 'svelte';
    import { onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store'; // Import writable store
    import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
    import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store';
    import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
    import GalleryImages from '$lib/components/partials/GalleryImages.svelte';
    import authStore from '$lib/stores/auth.store';
    import { chatIdStore } from '$lib/stores/chatIdStore';
    import { getWeatherIcon } from '$lib/utils/weather';

    let user;

    const unsubscribe = authStore.subscribe(async value => {
        if (value && value.isLoggedIn && value.userId) {
        user = await userFirestoreStore.getUser(value.userId);
        } else {
        user = null;
        }
    });

    let carTypes = [];

    let map;
    let L;
    let currentMarker = null; // reference to the current marker
    let dealer = writable(null); // Make dealer a writable store
    let customIcon; // Define customIcon variable

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

    async function updateCarTypes() {
        carTypes = await carTypeFirestoreStore.getCarTypesByBrandId($dealer.userId); // Update carTypes when dealer changes
        // console.log('carTypes for dealer', carTypes); // Log carTypes
    }

    $: if ($dealer) {
        mapActions.addMarker($dealer); // Use $dealer to access the value of the dealer store
        updateCarTypes();
    }

    export let mapActions = {
        async addMarker(newDealer) {
            dealer.set(newDealer); // Update the dealer object using set method

            // console.log('newDealer', newDealer);
            if (L) {
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }

            // Get weather icon
            const weather = await getWeatherIcon($dealer.latitude, $dealer.longitude, 'filled');
            const iconUrl = weather ? weather.icon : '/images/map-car-marker.png';

            // Use customIcon when creating the marker
            customIcon = L.icon({
                iconUrl: iconUrl,
                shadowUrl: '/images/map-weathersvg-shadow4.png',
                iconSize: [52, 60], // size of the icon
                shadowSize: [52, 60], // size of the shadow
                iconAnchor: [26, 60], // anchor at half width and full height to position the bottom center of the icon at the marker's location
                shadowAnchor: [26, 60], // anchor the shadow at the same point
                popupAnchor: [0, -60] // open the popup just above the icon
            });

                // Use customIcon when creating the marker
                currentMarker = L.marker([$dealer.latitude, $dealer.longitude], {icon: customIcon}).addTo(map); // Use $dealer to access the value of the dealer store
                map.flyTo([currentMarker.getLatLng().lat, currentMarker.getLatLng().lng], 16, { duration: 2.2 }); // Animate the transition to the new marker
            }
        }
    };

    // console.log("auth store data: ", authStore);

    async function startNewChat() {
        const chatId = await chatsFirestoreStore.createChat($dealer.userId, $authStore.userId, $dealer.name, $authStore.userName);
        // console.log('chatId:', chatId); // Log chatId
        chatIdStore.set({
            chatId: chatId,
            dealerUserId: $dealer.userId,
            authUserId: $authStore.userId
        });
        
        let url = `/chat/${chatId}`;
        // console.log('Navigating to:', url);
        goto(url);
        };

    onDestroy(() => {
        unsubscribe();
    });
</script>

<div id="secondary-map" style="height: 150px;"></div>
{#if user}
    <button class="button is-normal is-fullwidth mt-3 mb-3 has-brand-green-background" on:click={startNewChat}>Test Drive Chat</button>
    {:else}
    <button class="button is-normal is-fullwidth mt-3 mb-3 has-brand-green-background"><a href="/login"><u>login</u></a> / <a href="/signup"><u>Register</u>&nbsp;</a>to Book Test Drive</button>
{/if}
<GalleryImages {carTypes} />