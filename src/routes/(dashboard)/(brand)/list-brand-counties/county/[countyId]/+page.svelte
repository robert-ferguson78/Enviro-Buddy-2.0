<script lang="ts">
    import UpdateHead from '$lib/UpdateHead.svelte';
    import AddDealer from './addDealer.svelte';
    import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
    import 'leaflet/dist/leaflet.css';
    export let data; // Exported variable for the data passed to the component
    let dealers = data?.props?.dealers; // Get the dealers from the data

    // Add an isEditing property to each dealer
    dealers = dealers.map(dealer => ({ ...dealer, isEditing: false }));

    // Function for adding a dealer
    function addDealer() {
        setTimeout(() => {
        location.reload(); // Reload the page after 1 second
        }, 1000);
    }

    // Function for deleting a dealer
    async function deleteDealer(dealerId) {
        await dealerFirestoreStore.deleteDealer(dealerId); // Delete the dealer from the Firestore store
        console.log('Dealer deleted');
        location.reload(); // Reload the page
    }

    // Function for saving a dealer
    async function saveDealer(dealerId, updatedDealer) {
        await dealerFirestoreStore.updateDealer(dealerId, updatedDealer); // Update the dealer in the Firestore store
        location.reload(); // Reload the page
    }

    // Function for toggling the edit mode of a dealer
    function toggleEdit(dealer) {
        dealer.isEditing = !dealer.isEditing; // Toggle the isEditing property of the dealer
        dealers = dealers.slice(); // Create a new array to trigger a re-render
    }
</script>

<UpdateHead title="Dealers" description="Driving your Electric Dreams Today" />

<section class="section">
    <AddDealer on:add={addDealer} />
</section>

<!-- Loop over the dealers and display their information -->
{#each dealers as dealer (dealer._id)}
<div class="box">
  <div class="columns is-desktop">
    {#if dealer.isEditing}  <!-- If the dealer is in edit mode, display input fields for editing the dealer's information -->
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
    {:else} <!-- If the dealer is not in edit mode, display the dealer's information -->
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