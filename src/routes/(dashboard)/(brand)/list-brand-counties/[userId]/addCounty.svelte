<script>
  import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';
  import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
  import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
  import authStore from '$lib/stores/auth.store';
  import { createEventDispatcher } from 'svelte';

  // Use $state for reactive variables
  let user = $state(null);
  let county = $state("");

  const dispatch = createEventDispatcher();

  // Use $effect for subscription
  $effect(() => {
    const unsubscribe = authStore.subscribe(async value => {
      if (value && value.isLoggedIn && value.userId) {
        user = await userFirestoreStore.getUser(value.userId);
      } else {
        user = null;
      }
    });
    
    // Return cleanup function
    return unsubscribe;
  });

  // Add county but check if it exists first to stop duplicste county entries
  async function createCounty() {
    if (county) {
        try {
            const existingCounty = await countyFirestoreStore.getCheckForCounty(county, user.user_id);
            if (existingCounty) {
                messageActions.showError('County already exists!');
            } else {
                const newCounty = {
                    county: county,
                };
                const createdCounty = await countyFirestoreStore.addCounty(newCounty, user.user_id);
                messageActions.showSuccess('County successfully added!');
                county = ""; // Reset the form
                dispatch('add');
            }
          } catch (error) {
            console.error('Error adding county:', error);
            messageActions.showError('Error adding county!');
          }
        } else {
          messageActions.showError('Please select a county!');
        }
  }
</script>

    <form on:submit|preventDefault={createCounty}>
      <div class="field">
        <label class="label" for="county-select">Add County</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select bind:value={county} class="input" id="county" name="county">
              <option value="" disabled>Select county</option>
              <option value="antrim">Antrim</option>
              <option value="armagh">Armagh</option>
              <option value="carlow">Carlow</option>
              <option value="cavan">Cavan</option>
              <option value="clare">Clare</option>
              <option value="cork">Cork</option>
              <option value="derry">Derry</option>
              <option value="donegal">Donegal</option>
              <option value="down">Down</option>
              <option value="dublin">Dublin</option>
              <option value="fermanagh">Fermanagh</option>
              <option value="galway">Galway</option>
              <option value="kerry">Kerry</option>
              <option value="kildare">Kildare</option>
              <option value="kilkenny">Kilkenny</option>
              <option value="laois">Laois</option>
              <option value="leitrim">Leitrim</option>
              <option value="limerick">Limerick</option>
              <option value="longford">Longford</option>
              <option value="louth">Louth</option>
              <option value="mayo">Mayo</option>
              <option value="meath">Meath</option>
              <option value="monaghan">Monaghan</option>
              <option value="offaly">Offaly</option>
              <option value="roscommon">Roscommon</option>
              <option value="sligo">Sligo</option>
              <option value="tipperary">Tipperary</option>
              <option value="tyrone">Tyrone</option>
              <option value="waterford">Waterford</option>
              <option value="westmeath">Westmeath</option>
              <option value="wexford">Wexford</option>
              <option value="wicklow">Wicklow</option>
            </select>
          </div>
        </div>
    </div>
      <div class="field">
        <div class="control">
          <button class="button is-success is-fullwidth">Add County</button>
        </div>
      </div>
    </form>