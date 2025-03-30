<script>
    import { onMount } from 'svelte';
    import UpdateHead from '$lib/UpdateHead.svelte';
    import { goto } from '$app/navigation';
    import 'leaflet/dist/leaflet.css';
    import { chatsFirestoreStore } from '$lib/firebase/models/chats-firestore-store.svelte';
    import authStore from '$lib/stores/auth.store';
    import { reviewIdStore } from '$lib/stores/reviewIdStore';
    import { getWeatherForecast } from '$lib/utils/weather';
    import Reviews from '$lib/components/partials/chat/Reviews.svelte';
    import EvDetailView from '$lib/components/EvRouteServices/EvDetailView.svelte';
    
    // Using Svelte 5's $props() rune to access data from the load function
    const { data } = $props();
    
    // Using $state for reactive variables
    let dealer = $state(
      (data?.props?.dealer) || { 
        latitude: 0, 
        longitude: 0, 
        userId: '', 
        name: '', 
        brand: '', 
        county: '', 
        _id: '', 
        countyId: '', 
        image: '', 
        phone: '', 
        email: '', 
        website: '', 
        address: '', 
        carName: '' 
      }
    );
    let map = $state(null);
    let customIcon = $state(null);
    let forecast = $state([]);

    // Store the vehicles that match the dealer's brand
    let vehicles = $state(data?.props?.vehicles || []);
    
    // State to track the currently selected vehicle for detail view
    let selectedVehicle = $state(null);
    
    // Derived values for dealer coordinates
    let dealerLat = $derived(dealer.latitude || 0);
    let dealerLong = $derived(dealer.longitude || 0);
    
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
        if ($authStore.userId) {
            button.textContent = 'Book a Test Drive';
        } else {
            button.textContent = 'Login/Register to book a Test Drive';
        }
        button.className = 'button is-normal mt-3 mb-3 has-brand-green-background start-chat-button';
        div.appendChild(button);
        return div;
    }

    async function startNewChat() {
        const chatId = await chatsFirestoreStore.createChat(dealer.userId, $authStore.userId, dealer.name, $authStore.userName);
        // console.log('chatId:', chatId); // Log chatId
        reviewIdStore.set({
            chatId: chatId,
            dealerUserId: dealer.userId,
            authUserId: $authStore.userId
        });
        let url;
        if ($authStore.userId) {
            url = `/chat/${chatId}`;
        } else {
            url = `/login`;
        }
        // console.log('Navigating to:', url);
        goto(url);
    };

    // Function to show vehicle details when a vehicle card is clicked
    function showVehicleDetails(vehicle) {
        selectedVehicle = vehicle;
    }
    
    // Function to close the vehicle details modal
    function closeVehicleDetails() {
        selectedVehicle = null;
    }

	// Assign body types to icon images
	function getBodyTypeImage(bodyType) {
	const bodyTypeMap = {
		'City Car': '/images/city-car.png',
		'Convertible': '/images/convertible.png',
		'Crossover': '/images/crossover.png',
		'Fastback': '/images/fastback.png',
		'Hatchback': '/images/hatchback.png',
		'Quadricycle': '/images/quadricycle.png',
		'SUV': '/images/suv.png',
		'SUV Coupe': '/images/suv-coupe.png',
		'Saloon': '/images/saloon.png',
		'Sedan': '/images/saloon.png', // Adding Sedan as an alias for Saloon
		'Van': '/images/van.png'
	};
	
	return bodyTypeMap[bodyType] || '/images/default-image-car.png'; // Default image if body type not found
	}
</script>

<UpdateHead title="Electric Car Dealer {dealer.name}" description="Driving your Electric Dreams Today" />

<h1 class="title has-text-centered">Car Dealer: {dealer.name}</h1>
<div class="columns">
    <div class="column is-two-thirds">
        <div id="map" style="height: 300px;"></div>
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
    <div class="column is-one-thirds">
            <Reviews dealerId={dealer._id} />
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

<!-- New section: Display vehicles from the dealer's brand -->
<section class="section">
    <h2 class="title has-text-centered">{dealer.brand} Electric Vehicles Available</h2>
    
    {#if vehicles.length > 0}
        <div class="columns is-multiline">
            {#each vehicles as vehicle (vehicle.id)}
                <div class="column is-one-third">
                    <!-- Vehicle card with click handler to show details -->
                    <div class="card vehicle-card" onclick={() => showVehicleDetails(vehicle)}>
                        <div class="card-content">
                            <div class="card-header">
                                <p class="title is-4">{vehicle.brand} {vehicle.model}</p>
                                <div class="body-type-image">
                                    <img src={getBodyTypeImage(vehicle.body_type)} alt={vehicle.body_type} />
                                </div>
                            </div>
                            <p class="subtitle is-6">{vehicle.variant || ''} ({vehicle.release_year})</p>
                            
                            <div class="content">
                                <ul>
                                    <li><strong>Range:</strong> {vehicle.wltp_range_km} km</li>
                                    <li><strong>Battery:</strong> {vehicle.usable_battery_size} kWh</li>
                                    <li><strong>Body Type:</strong> {vehicle.body_type}</li>
                                </ul>
                                <button class="button is-primary is-fullwidth">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="has-text-centered">No {dealer.brand} electric vehicles available at the moment.</p>
    {/if}
</section>

<!-- Vehicle detail modal -->
{#if selectedVehicle}
    <EvDetailView vehicle={selectedVehicle} onClose={closeVehicleDetails} />
{/if}

<style>
    .vehicle-card {
        height: 100%;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
    }
    
    .vehicle-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    .vehicle-card img {
        object-fit: cover;
        width: 100%;
        height: 200px;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        flex-direction: row;
        flex-wrap: nowrap;
        box-shadow: none;
        border-bottom: solid grey .5px;
    }
    
    .card-header .title {
        margin: 0;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .body-type-image {
        width: 160px;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 10px;
        flex-shrink: 0;
    }
    
    .body-type-image img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        height: auto;
    }
</style>