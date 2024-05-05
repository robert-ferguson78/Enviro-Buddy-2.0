<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AddCounty from './addCounty.svelte';
  export let data;
  let counties = data?.props?.counties;
  // console.log('Props in Svelte component:', $$props);
  // console.log('Counties in Svelte component:', counties);

  function addCounty() {
  console.log('addCounty function called');

  // Wait for 1 second before reloading the page
  setTimeout(() => {
    location.reload();
  }, 1000);
}

</script>

<UpdateHead title="Dealer" description="Driving your Electric Dreams Today" />

<section class="section">
  <AddCounty on:add={addCounty} />
</section>

{#each Array(Math.ceil(counties.length / 3)) as _, i}
  <div class="columns">
    {#each counties.slice(i * 3, i * 3 + 3) as county (county._id)}
      <div class="column is-one-third">
        <div class="box box-link-hover-shadow">
          <h2 class="title">
            <span class="caps">{county.county}</span> Car Dealers
          </h2>
            <a href="/county/idHere" class="button">
              <span class="icon is-small">
                <i class="fa-sharp fa-solid fa-location-pen"></i>
              </span>
            </a>
            <a href="/county/deletecounty/idHere" class="button">
              <i class="fa-solid fa-trash-xmark"></i>
            </a>
        </div>
      </div>
    {/each}
  </div>
{/each}