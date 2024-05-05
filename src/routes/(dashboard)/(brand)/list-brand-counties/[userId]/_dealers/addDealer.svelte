<script lang="ts">
  import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';
  import { getUser } from '$lib/firebase/models/user-firestore.store';
  import messagesStore from '$lib/stores/messages.store';
  import authStore from '$lib/stores/auth.store';
  import type { NewCounty } from "$lib/types/enviro-buddy-types.ts";
  import { createEventDispatcher } from 'svelte';

  let user;

  const dispatch = createEventDispatcher();

  const unsubscribe = authStore.subscribe(async value => {
    if (value && value.isLoggedIn && value.userId) {
      user = await getUser(value.userId);
      // console.log(user, 'user object'); // Log the user object
      // console.log(user.user_id, 'user id here2');
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

  async function createDealer() {
    if (county) {
        try {
            const existingCounty = await countyFirestoreStore.getCheckForCounty(county, user.user_id);
            if (existingCounty) {
                messagesStore.showError('County already exists!');
            } else {
                const newCounty: NewCounty = {
                    county: county,
                };
                const createdCounty = await countyFirestoreStore.addCounty(newCounty, user.user_id);
                messagesStore.showSuccess('County successfully added!');
                dispatch('add');
            }
        } catch (error) {
            messagesStore.showError('Error adding county!');
        }
    }
  }
</script>

    <form on:submit|preventDefault={createDealer}>
    <form class="box" action="/county/countyId/adddealer" method="POST">
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
            <input bind:value={Latidude} id="latitude" class="input" type="number" step=".0000001" placeholder="Latidude" name="latitude">
          </div>
          <div class="field">
            <input bind:value={longitude} id="longitude" class="input" type="number" step=".0000001" placeholder="Longitude" name="longitude">
          </div>
        </div>
      </div>
      <button class="button is-primary">Add Dealer</button>
    </form>
    