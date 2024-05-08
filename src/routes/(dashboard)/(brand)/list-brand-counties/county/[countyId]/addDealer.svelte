<script lang="ts">
  import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
  import { getUser } from '$lib/firebase/models/user-firestore.store';
  import messagesStore from '$lib/stores/messages.store';
  import authStore from '$lib/stores/auth.store';
  import { createEventDispatcher } from 'svelte';
  import { page } from '$app/stores';
  import { onDestroy } from 'svelte';
  import LeafletMap from './LeafletMap.svelte';

  let user;

  const dispatch = createEventDispatcher();

  const unsubscribe = authStore.subscribe(async value => {
    if (value && value.isLoggedIn && value.userId) {
      user = await getUser(value.userId);
    } else {
      user = null;
    }
  });

  let name = "";
  let address = "";
  let phone = "";
  let email = "";
  let website = "";
  let latitude = 0.1;
  let longitude = 0.1;
  let countyId;

  const unsubscribePage = page.subscribe(({ params }) => {
    countyId = params.countyId;
  });

  onDestroy(() => {
    unsubscribePage();
  });

  function setCoordinates({ lat, lng }) {
    latitude = lat;
    longitude = lng;
  }

  async function createDealer() {
    if (user && user.user_id) {
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
            const createdDealer = await dealerFirestoreStore.addDealer(countyId, newDealer);
            messagesStore.showSuccess('Dealer successfully added!');
            dispatch('add');
        } catch (error) {
            messagesStore.showError('Error adding dealer!');
        }
    }
  }
</script>

<LeafletMap {setCoordinates} />

    <form on:submit|preventDefault={createDealer}>
      <label for="dealer-details">Enter Dealer Details:</label>
      <div class="field is-horizontal">
        <div class="field-body">
          <div class="field">
            <input bind:value={name} class="input" type="text" placeholder="Dealer Name" name="name">
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
    