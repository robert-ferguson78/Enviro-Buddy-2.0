<script>
  import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
  import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
  import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
  import authStore from '$lib/stores/auth.store';
  import { createEventDispatcher } from 'svelte';
  import { page } from '$app/stores';
  import { onDestroy } from 'svelte';
  import LeafletMap from './LeafletMap.svelte';
  
  // Using Svelte 5's $props() rune to destructure and provide default values for component props
  // This replaces the traditional 'export let' syntax from Svelte 4
  const { dealers = [] } = $props();

  // Using Svelte 5's $state rune for reactive variables
  // This replaces 'let' variables with reactive declarations in Svelte 4
  let user = $state(null);
  let name = $state("");
  let address = $state("");
  let phone = $state("");
  let email = $state("");
  let website = $state("");
  let latitude = $state(0.1);
  let longitude = $state(0.1);
  let countyId = $state("");
  
  const dispatch = createEventDispatcher();
  
  // Using Svelte 5's $effect rune for side effects
  // This replaces onMount, $: reactive statements, and store subscriptions from Svelte 4
  // The effect automatically tracks dependencies and runs when they change
  $effect(() => {
    // Subscribe to auth store and handle cleanup with return function
    // This pattern replaces the manual unsubscribe in onDestroy from Svelte 4
    const unsubscribe = authStore.subscribe(async value => {
      if (value && value.isLoggedIn && value.userId) {
        user = await userFirestoreStore.getUser(value.userId);
      } else {
        user = null;
      }
    });
    
    // Returning the unsubscribe function automatically cleans up when the component is destroyed
    return unsubscribe;
  });
  
  // Another effect for page params, showing how Svelte 5 simplifies store subscriptions
  $effect(() => {
    const unsubscribe = page.subscribe(({ params }) => {
      countyId = params.countyId;
    });
    
    return unsubscribe;
  });
  
  // Function to update coordinates from map component
  // Functions that update state variables work with Svelte 5's reactivity system
  function setCoordinates({ lat, lng }) {
    latitude = lat;
    longitude = lng;
  }
  
  // Async function for dealer creation
  // In Svelte 5, updating state variables in async functions triggers reactivity automatically
  async function createDealer() {
    if (!user || !user.user_id) {
      messageActions.showError('You must be logged in to add a dealer');
      return;
    }
    
    if (!name) {
      messageActions.showError('Dealer name is required');
      return;
    }
    
    try {
      const newDealer = {
        name,
        address,
        phone,
        email,
        website,
        latitude,
        longitude,
        countyId,
        userId: user.user_id
      };
      
      console.log('Adding dealer:', newDealer);
      const createdDealer = await dealerFirestoreStore.addDealer(countyId, newDealer);
      
      // Reset form - in Svelte 5, these assignments trigger reactivity automatically
      name = "";
      address = "";
      phone = "";
      email = "";
      website = "";
      latitude = 0.1;
      longitude = 0.1;
      
      messageActions.showSuccess('Dealer successfully added!');
      dispatch('add');
    } catch (error) {
      console.error('Error adding dealer:', error);
      messageActions.showError('Error adding dealer: ' + error.message);
    }
  }
  </script>
  
  <!-- Passing props to child components works the same in Svelte 5 -->
  <LeafletMap {setCoordinates} {dealers} />
  
  <!-- Form handling is similar to Svelte 4, but with improved reactivity under the hood -->
  <form onsubmit={createDealer}>
    <label for="dealer-details">Enter Dealer Details:</label>
    <div class="field is-horizontal">
      <div class="field-body">
        <div class="field">
          <input bind:value={name} class="input" type="text" placeholder="Dealer Name" name="name" required>
        </div>
        <div class="field">
          <input bind:value={address} class="input" type="text" placeholder="Dealer Address" name="address">
        </div>
        <div class="field">
          <input bind:value={phone} class="input" type="text" placeholder="Phone" name="phone">
        </div>
        <div class="field">
          <input bind:value={email} class="input" type="email" placeholder="Email" name="email">
        </div>
        <div class="field">
          <input bind:value={website} class="input" type="text" placeholder="Website" name="website">
        </div>
        <div class="field">
          <input bind:value={latitude} id="Latitude" class="input" type="number" step=".0000001" placeholder="latitude" name="latitude">
        </div>
        <div class="field">
          <input bind:value={longitude} id="longitude" class="input" type="number" step=".0000001" placeholder="Longitude" name="longitude">
        </div>
      </div>
    </div>
    <button class="button is-primary">Add Dealer</button>
  </form>  