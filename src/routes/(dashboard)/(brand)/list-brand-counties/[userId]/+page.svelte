<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AddCounty from './addCounty.svelte';
  import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';
  import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
  import { onMount } from 'svelte';

  // Use $props() for data
  const { data } = $props();

  // Use $state for counties
  let counties = $state([]); // Initialize as empty array with $state
  let userId = $state('');
  let dataProcessed = $state(false); // Flag to prevent infinite loops issue

  // Initialize counties from data on component mount
  onMount(() => {
    console.log('Component mounted, data:', data);
    if (data?.props && !dataProcessed) {
      counties = data.props.counties || [];
      userId = data.props.userId;
      dataProcessed = true; // Set flag to prevent reprocessing
      console.log('Counties loaded on mount:', counties.length);
    }
  });

  // Update counties when data changes
  $effect(() => {
    console.log('Data changed:', data);
    if (data?.props && !dataProcessed) {
      counties = data.props.counties || [];
      userId = data.props.userId;
      dataProcessed = true;
      console.log('Counties updated from effect:', counties.length);
    }
  });

  // Updated function to load counties
  async function loadCounties() {
    try {
      console.log('Loading counties for user:', userId);
      const updatedCounties = await countyFirestoreStore.getCountiesByUserId(userId);
      console.log('Loaded counties:', updatedCounties.length);
      counties = updatedCounties;
      return true;
    } catch (error) {
      console.error('Error loading counties:', error);
      messageActions.showError('Failed to load counties');
      return false;
    }
  }

  // Updated function called when a new county is added
  async function addCounty() {
    console.log('addCounty function called');
    dataProcessed = false; // Reset flag to allow data processing
    const success = await loadCounties();
    if (success) {
      messageActions.showSuccess('County added successfully!');
    }
  }
  // Updated function to delete a county
  async function deleteCounty(countyId) {
    try {
      console.log('Deleting county', countyId);
      await countyFirestoreStore.deleteCountyById(countyId);
      console.log('County deleted');

      // Remove the county from the local array immediately for UI update
      counties = counties.filter(county => county._id !== countyId);

      // Reset the flag to allow data processing
      dataProcessed = false;

      // Also reload from the server to ensure consistency
      loadCounties().then(success => {
        if (success) {
          messageActions.showSuccess('County deleted successfully!');
        }
      });
    } catch (error) {
      console.error('Error deleting county:', error);
      messageActions.showError('Failed to delete county');
    }
  }
</script>

<UpdateHead title="Counties" description="Driving your Electric Dreams Today" />

<section class="section">
  <AddCounty on:add={addCounty} />
</section>

<!-- added check for no counties -->
{#if counties && counties.length > 0}
  {#each Array(Math.ceil(counties.length / 3)) as _, i}
    <div class="columns">
      {#each counties.slice(i * 3, i * 3 + 3) as county (county._id)}
        <div class="column is-one-third">
          <div class="box box-link-hover-shadow">
            <h2 class="title">
              <span class="caps">{county.county}</span> Car Dealers
            </h2>
            <a href={`/list-brand-counties/county/${county._id}`} class="button">
              <span class="icon is-small">
                <i class="fa-sharp fa-solid fa-location-pen"></i>
              </span>
            </a>
            <button class="button" on:click={() => deleteCounty(county._id)}>
              <i class="fa-solid fa-trash-xmark"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/each}
{:else}
  <div class="notification is-info">
    No counties found. Add a county to get started.
  </div>
{/if}