<script lang="ts">
    import { onMount } from 'svelte';
    import UpdateHead from '$lib/UpdateHead.svelte';
    import { goto } from '$app/navigation';
    import 'leaflet/dist/leaflet.css';
    import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store';
    import authStore from '$lib/stores/auth.store';
    import { reviewIdStore } from '$lib/stores/reviewIdStore';
    import { getWeatherForecast } from '$lib/utils/weather';
    import Reviews from '$lib/components/partials/chat/Reviews.svelte';

    export let data;
    let dealer = data?.props?.dealer || [];
    let map;
    let customIcon;
    let forecast = [];
    let dealerLat = dealer.latitude;
    let dealerLong = dealer.longitude;

    onMount(async () => {
        const L = (await import('leaflet')).default;
        map = L.map('map').setView([dealerLat, dealerLong], 13);

        customIcon = L.icon({
                iconUrl: '/images/map-car-marker.png',
                shadowUrl: '/images/map-car-marker-shadow.png',
                iconSize: [52, 60], // size of the icon
                shadowSize: [52, 60], // size of the shadow
                iconAnchor: [26, 60], // anchor at half width and full height to position the bottom center of the icon at the marker's location
                shadowAnchor: [26, 60], // anchor the shadow at the same point
                popupAnchor: [0, -60] // open the popup just above the icon
            });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const marker = L.marker([dealerLat, dealerLong], {icon: customIcon}).addTo(map);

        const popupContent = createPopupHTML(dealer);
        const popup = L.popup().setContent(popupContent);

        marker.bindPopup(popup).openPopup();

        // Attach click event listener to the button in the popup
        // Delay the attachment of the event listener until after the popup content is attached to the DOM
        setTimeout(() => {
            const button = document.querySelector('.start-chat-button');
            button.addEventListener('click', startNewChat);
        }, 0);

        const forecastData = await getWeatherForecast(dealerLat, dealerLong, "icon");
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        forecast = forecastData.filter(day => day.date > currentTimeInSeconds).slice(0, 5);
    });

    function createPopupHTML(dealer) {
        const div = document.createElement('div');
        const button = document.createElement('button');
        button.textContent = 'Book a Test Drive';
        button.className = 'button is-normal mt-3 mb-3 has-brand-green-background start-chat-button';
        div.appendChild(button);
        return div;
    }

    async function startNewChat() {
        const chatId = await chatsFirestoreStore.createChat(dealer.userId, $authStore.userId, dealer.name, $authStore.userName);
        console.log('chatId:', chatId); // Log chatId
        reviewIdStore.set({
            chatId: chatId,
            dealerUserId: dealer.userId,
            authUserId: $authStore.userId
        });
        let url = `/chat/${chatId}`;
        console.log('Navigating to:', url);
        goto(url);
    };
</script>

<UpdateHead title="Electric Car Dealer {dealer.name}" description="Driving your Electric Dreams Today" />

<h1 class="title has-text-centered">Car Dealer: {dealer.name}</h1>
<div class="columns is-multiline">
    <div class="column is-two-thirds">
        <div id="map" style="height: 350px;"></div>
    </div>
        <div class="column is-one-third">
            <div class="box box-link-hover-shadow">
                <h2 class="title">
                    Contact details
                </h2>
                <img src={dealer.image} alt={dealer.carName}>
                <h3 class="subtitle">
                    <b>Phone:</b> {dealer.phone}<br/>
                    <b>Email:</b> {dealer.email}<br/>
                    <b>Website:</b> {dealer.website}<br/>
                    <b>Adress:</b><br/>{dealer.address}<br/>
                    <b>County:</b> {dealer.county}<br/>
                    <b>Car Brand:</b> {dealer.brand}<br/>
                </h3>
            </div>
        </div>
</div>
<h2 class="subtitle has-text-centered">Weather for test drive at {dealer.name} for next 5 days</h2>
<div class="columns is-multiline">
    {#each forecast as day (day.date)}
        <div class="column is-one-fifth">
            <div class="card">
                <div class="card-content">
                    <p class="title">{new Date(day.date * 1000).toLocaleDateString(undefined, { weekday: 'long' })}
                        {new Date(day.date * 1000).toLocaleTimeString()}</p>
                    <p class="subtitle">{day.temp}°C</p>
                    <figure class="image is-64x64">
                        <img src={day.icon} alt={day.description}>
                    </figure>
                    <p>{day.description}</p>
                </div>
            </div>
        </div>
    {/each}
</div>
<Reviews activeReview={activeReview} dealerId={dealerId} />
