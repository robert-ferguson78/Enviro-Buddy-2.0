<script lang="ts">
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AddCounty from './addCounty.svelte';
  import { countyFirestoreStore } from '$lib/firebase/models/county-firestore-store';
  export let data;
  // let counties = [];
  let counties = data?.props?.counties;
  // console.log('Props in Svelte component:', $props);
  // console.log('Counties in Svelte component:', counties);

  $: {
    if (data?.props?.counties) {
      counties = data.props.counties;
    }
  }

  function addCounty() {
  console.log('addCounty function called');

  // Wait for 1 second before reloading the page
  setTimeout(() => {
    location.reload();
  }, 1000);
}

async function deleteCounty(countyId) {
  console.log('Deleting county', countyId);
    await countyFirestoreStore.deleteCountyById(countyId);
    console.log('County deleted');
    location.reload();
  }

</script>

<UpdateHead title="Counties" description="Driving your Electric Dreams Today" />

<section class="section">
  <AddCounty on:add={addCounty} />
</section>

{#if counties}
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
{/if}