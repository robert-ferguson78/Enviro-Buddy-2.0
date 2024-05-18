<script lang="ts">
    import UpdateHead from '$lib/UpdateHead.svelte';
    import AddDealer from './addDealer.svelte';
    import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
    import 'leaflet/dist/leaflet.css';
    export let data;
    let dealers = data?.props?.dealers;

    dealers = dealers.map(dealer => ({ ...dealer, isEditing: false }));

    function addDealer() {
        // console.log('addDealer function called');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }

    async function deleteDealer(dealerId) {
        // console.log('Deleting dealer', dealerId);
        await dealerFirestoreStore.deleteDealer(dealerId);
        console.log('Dealer deleted');
        location.reload();
    }

    async function saveDealer(dealerId, updatedDealer) {
        await dealerFirestoreStore.updateDealer(dealerId, updatedDealer);
        location.reload();
    }

    function toggleEdit(dealer) {
    dealer.isEditing = !dealer.isEditing;
    dealers = dealers.slice(); // This creates a new array, triggering a re-render
  }
</script>

<UpdateHead title="Dealers" description="Driving your Electric Dreams Today" />

<section class="section">
    <AddDealer on:add={addDealer} />
</section>

{#each dealers as dealer (dealer._id)}
<div class="box">
  <div class="columns is-desktop">
    {#if dealer.isEditing}
        <div class="column is-2"><h6 class="has-brand-green">Edit Name</h6><input bind:value={dealer.name} /></div>
        <div class="column is-2"><h6 class="has-brand-green">Edit Address</h6><textarea bind:value={dealer.address} /></div>
        <div class="column is-2"><h6 class="has-brand-green">Edit Phone</h6><input bind:value={dealer.phone} /></div>
        <div class="column is-2"><h6 class="has-brand-green">Edit Email</h6><input bind:value={dealer.email} /></div>
        <div class="column is-2"><h6 class="has-brand-green">Edit Website</h6><input bind:value={dealer.website} /></div>
        <div class="column is-1"><h6 class="has-brand-green">Edit Geo Location</h6>
            <input bind:value={dealer.latitude} />
            <input bind:value={dealer.longitude} />
        </div>
        <div class="column is-1">
            <button class="button is-fullwidth has-brand-green-background mb-2" on:click={() => saveDealer(dealer._id, dealer)}>Save</button>
            <button class="button is-fullwidth is-info" on:click={() => toggleEdit(dealer)}>Cancel</button>
        </div>
    {:else}
        <div class="column is-2"><h6 class="has-text-link">Name</h6>{dealer.name}</div>
        <div class="column is-2"><h6 class="has-text-link">Address</h6>{dealer.address}</div>
        <div class="column is-2"><h6 class="has-text-link">Phone</h6>{dealer.phone}</div>
        <div class="column is-2"><h6 class="has-text-link">Email</h6>{dealer.email}</div>
        <div class="column is-2"><h6 class="has-text-link">Website</h6>{dealer.website}</div>
        <div class="column is-1"><h6 class="has-text-link">Geo Location</h6>
            {dealer.latitude}
            {dealer.longitude}
        </div>
        <div class="column is-1">
            <button class="button is-fullwidth has-deep-red-background mb-2" on:click={() => deleteDealer(dealer._id)}>
                <i class="fa-solid fa-trash-xmark"></i>&nbsp; Delete
            </button>
            <button class="button is-fullwidth has-brand-green-background" on:click={() => { toggleEdit(dealer); dealers = dealers; }}>
                <i class="fa-sharp fa-solid fa-location-pen"></i>&nbsp; Edit
            </button>
        </div>
    {/if}
  </div>
</div>
{/each}