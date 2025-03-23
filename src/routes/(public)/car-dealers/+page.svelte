<script>
    import UpdateHead from '$lib/UpdateHead.svelte';
    import { goto } from '$app/navigation'; 
    
    // Using Svelte 5's $props() rune to access data from the load function
    const { data } = $props();
    
    // Using $state for reactive variables
    let dealers = $state(data?.props?.dealers || []);
    let selectedBrand = $state('');
    let selectedCounty = $state('');
    
    // Using $derived for computed values
    // This replaces the $: reactive declarations in Svelte 4
    let brands = $derived([...new Set(dealers.map(dealer => dealer.brand))]);
    let counties = $derived([...new Set(dealers.map(dealer => dealer.county))]);
    
    // Another $derived value for filtered dealers
    let filteredDealers = $derived(
      dealers.filter(dealer =>
        (selectedBrand ? dealer.brand === selectedBrand : true) &&
        (selectedCounty ? dealer.county === selectedCounty : true)
      )
    );

    function selectDealer(dealerId) {
        goto(`/car-dealers/${dealerId}`);
    }
  
</script>
  
<UpdateHead title="Electric Car Dealers" description="Driving your Electric Dreams Today" />

<h1 class="title has-text-centered">Electric Car Dealers</h1>
<div class="box is-flex is-align-items-center is-justify-content-center">
    <span class="pl-3 pr-3">Search by Car Brand: </span>
    <div class="select">
        <select bind:value={selectedBrand}>
            <option value="">All Brands</option>
            {#each brands as brand (brand)}
                <option value={brand}>{brand}</option>
            {/each}
        </select>
    </div>
    <span class="pl-3 pr-3">and/or by County: </span>
    <div class="select">
        <select bind:value={selectedCounty}>
            <option value="">All Counties</option>
            {#each counties as county (county)}
                <option value={county}>{county}</option>
            {/each}
        </select>
    </div>
</div>

<div class="columns is-multiline">
    {#each filteredDealers as dealer (dealer.dealerId)}
        <div class="column is-one-third">
            <div class="box box-link-hover-shadow">
                <h2 class="title">
                    {dealer.name}
                </h2>
                <img src={dealer.image} alt={dealer.carName}>
                <h3 class="subtitle">
                    Adress: {dealer.address}<br/>
                    Phone: {dealer.phone}<br/>
                    Email: {dealer.email}<br/>
                    Website: {dealer.website}<br/>
                    County: {dealer.county}<br/>
                    Car Brand: {dealer.brand}<br/>
                </h3>
                <button class="button is-normal is-fullwidth mt-3 mb-3 has-brand-green-background" onclick={() => selectDealer(dealer.dealerId)}>Go to Car Dealer</button>
            </div>
        </div>
    {/each}
</div>