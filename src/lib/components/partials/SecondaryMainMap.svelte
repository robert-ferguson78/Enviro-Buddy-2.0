<script>
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
    import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store.svelte';
    import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
    import GalleryImages from '$lib/components/partials/GalleryImages.svelte';
    import authStore from '$lib/stores/auth.store';
    import { chatIdStore } from '$lib/stores/chatIdStore';
    import { getWeatherIcon } from '$lib/utils/weather';

    // Use the dealer store passed from MainMap
    let { dealerStore } = $props();
    
    console.log('[SecondaryMap] Component initialized');

    let user = $state(null);
    let carTypes = $state([]);
    let map;
    let L;
    let currentMarker = $state(null);
    let dealer = $state(null);
    let customIcon;
    
    // Subscribe to the dealer store
    const unsubscribeDealerStore = dealerStore.subscribe(newDealer => {
        if (newDealer) {
            console.log('[SecondaryMap] Dealer updated from store:', newDealer.name);
            dealer = newDealer;
            updateMap(newDealer);
        }
    });

    const unsubscribeAuth = authStore.subscribe(async value => {
        if (value && value.isLoggedIn && value.userId) {
            user = await userFirestoreStore.getUser(value.userId);
            console.log('[SecondaryMap] User authenticated:', user);
        } else {
            user = null;
            console.log('[SecondaryMap] No authenticated user');
        }
    });

    onMount(async () => {
        console.log('[SecondaryMap] Component mounted');
        if (typeof window !== 'undefined') {
            const module = await import('leaflet');
            L = module.default;

            map = L.map('secondary-map', { zoomSnap: 0, doubleClickZoom: false }).setView([53.340610, -7.673507], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);
            
            console.log('[SecondaryMap] Map initialized');
            
            // If we already have a dealer, update the map
            if (dealer) {
                updateMap(dealer);
            }
        }
    });

    async function updateMap(newDealer) {
        if (!L || !map || !newDealer) return;
        
        console.log('[SecondaryMap] Updating map with dealer:', newDealer.name);
        
        if (currentMarker) {
            console.log('[SecondaryMap] Removing existing marker');
            map.removeLayer(currentMarker);
        }
        
        console.log('[SecondaryMap] Getting weather icon');
        const weather = await getWeatherIcon(newDealer.latitude, newDealer.longitude, 'filled');
        const iconUrl = weather ? weather.icon : '/images/map-car-marker.png';
        
        console.log('[SecondaryMap] Creating icon with URL:', iconUrl);
        customIcon = L.icon({
            iconUrl: iconUrl,
            shadowUrl: '/images/map-weathersvg-shadow4.png',
            iconSize: [52, 60],
            shadowSize: [52, 60],
            iconAnchor: [26, 60],
            shadowAnchor: [26, 60],
            popupAnchor: [0, -60]
        });
        
        console.log('[SecondaryMap] Adding marker at:', newDealer.latitude, newDealer.longitude);
        currentMarker = L.marker([newDealer.latitude, newDealer.longitude], {icon: customIcon}).addTo(map);
        map.flyTo([currentMarker.getLatLng().lat, currentMarker.getLatLng().lng], 16, { duration: 2.2 });
        
        // Update car types
        await updateCarTypes();
    }

    async function updateCarTypes() {
        console.log('[SecondaryMap] updateCarTypes called, dealer:', dealer);
        if (dealer && dealer.userId) {
            console.log('[SecondaryMap] Fetching car types for userId:', dealer.userId);
            carTypes = await carTypeFirestoreStore.getCarTypesByBrandId(dealer.userId);
            console.log('[SecondaryMap] Car types updated:', carTypes.length);
        } else {
            console.log('[SecondaryMap] No dealer or userId available for car types');
        }
    }

    async function startNewChat() {
        console.log('[SecondaryMap] Starting new chat');
        const chatId = await chatsFirestoreStore.createChat(dealer.userId, $authStore.userId, dealer.name, $authStore.userName);
        chatIdStore.set({
            chatId: chatId,
            dealerUserId: dealer.userId,
            authUserId: $authStore.userId
        });
        
        let url = `/chat/${chatId}`;
        console.log('[SecondaryMap] Navigating to:', url);
        goto(url);
    }

    onDestroy(() => {
        console.log('[SecondaryMap] Component destroyed');
        unsubscribeAuth();
        unsubscribeDealerStore();
    });
</script>

<div id="secondary-map" style="height: 150px;"></div>
{#if user}
    <button class="button is-normal is-fullwidth mt-3 mb-3 has-brand-green-background" onclick={startNewChat}>Test Drive Chat</button>
{:else}
    <button class="button is-normal is-fullwidth mt-3 mb-3 has-brand-green-background"><a href="/login"><u>login</u></a> / <a href="/signup"><u>Register</u> </a>to Book Test Drive</button>
{/if}
<GalleryImages {carTypes} />