<script>
    import UpdateHead from '$lib/UpdateHead.svelte';
    import AddDealer from './addDealer.svelte';
    import { dealerFirestoreStore } from '$lib/firebase/models/dealer-firestore-store';
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
    import 'leaflet/dist/leaflet.css';
    
    // Using Svelte 5's $props() rune to access data passed from the parent component or load function
    // This replaces the traditional 'export let data' syntax from Svelte 4
    // The data object contains dealers and countyId from the server-side load function
    const { data } = $props();

    // Using Svelte 5's $state rune for reactive state management
    // These variables will automatically trigger UI updates when modified
    let dealers = $state([]);
    let dataProcessed = $state(false);

    // Using Svelte 5's $effect rune for reactive side effects
    // This replaces the $: reactive statements and onMount lifecycle hook from Svelte 4
    // The effect automatically runs when its dependencies (data, dataProcessed) change
    $effect(() => {
        // Only process data if it exists and hasn't been processed yet
        if (data?.props?.dealers && !dataProcessed) {
            // Transform the raw dealer data to include UI state (isEditing flag)
            // This pattern separates server data from UI state
            dealers = data.props.dealers.map(dealer => ({ 
            ...dealer, 
            isEditing: false // Add UI state property for edit mode
            }));

            // Mark data as processed to prevent duplicate processing
            dataProcessed = true;
            console.log('Dealers loaded:', dealers.length);
        }
    });

    // Function to handle dealer addition from the AddDealer component
    // In Svelte 5, this function can directly update state variables
    function addDealer(newDealer) {
        console.log('Dealer added, refreshing page');
        messageActions.showSuccess('Dealer added successfully!');
        
        // Use setTimeout to delay the refresh for better UX
        // This gives time for the success message to be seen
        setTimeout(() => {
            // Reset the processed flag to allow reprocessing of data
            dataProcessed = false; // Reset to allow reprocessing data
            
            // Fetch updated dealers from Firestore
            // This is more efficient than reloading the entire page
            dealerFirestoreStore.getDealersByCountyId(data.props.countyId)
            .then(updatedDealers => {
                // Update the dealers array with fresh data and UI state
                dealers = updatedDealers.map(dealer => ({ 
                ...dealer, 
                isEditing: false 
                }));
            })
            .catch(error => {
                console.error('Error refreshing dealers:', error);
                messageActions.showError('Failed to refresh dealers');
            });
        }, 1000);
    }

    // Async function to delete a dealer
    // In Svelte 5, async functions can directly update state variables
    async function deleteDealer(dealerId) {
        try {
            console.log('Deleting dealer:', dealerId);
            // Delete the dealer from Firestore
            await dealerFirestoreStore.deleteDealer(dealerId);
            
            // Optimistically update the UI by removing the dealer from the local array
            // This provides immediate feedback without waiting for a server response
            dealers = dealers.filter(d => d._id !== dealerId);
            
            messageActions.showSuccess('Dealer deleted successfully!');
        } catch (error) {
            console.error('Error deleting dealer:', error);
            messageActions.showError('Failed to delete dealer');
        }
    }

    // Async function to save changes to a dealer
    async function saveDealer(dealerId, updatedDealer) {
        try {
            console.log('Saving dealer:', dealerId);
            // Update the dealer in Firestore
            await dealerFirestoreStore.updateDealer(dealerId, updatedDealer);
            
            // Update the local dealers array with the changes and exit edit mode
            // This immutable update pattern works well with Svelte 5's reactivity
            dealers = dealers.map(d => {
            if (d._id === dealerId) {
                return { ...updatedDealer, isEditing: false };
            }
            return d;
            });
            
            messageActions.showSuccess('Dealer updated successfully!');
        } catch (error) {
            console.error('Error updating dealer:', error);
            messageActions.showError('Failed to update dealer');
        }
    }

    // Function to toggle edit mode for a specific dealer
    function toggleEdit(dealer) {
    // Update the specific dealer's isEditing property using immutable update pattern
    // In Svelte 5, this assignment automatically triggers UI updates
    dealers = dealers.map(d => {
        if (d._id === dealer._id) {
        return { ...d, isEditing: !d.isEditing };
        }
        return d;
    });
}
</script>
<!-- UpdateHead component for setting page metadata -->
<UpdateHead title="Dealers" description="Driving your Electric Dreams Today" />

<!-- Section containing the AddDealer component -->
<section class="section">
    <!-- Pass the dealers array to AddDealer and listen for the 'add' event -->
    <AddDealer on:add={addDealer} dealers={dealers} />
</section>

<!-- Conditional rendering based on dealers array length -->
{#if dealers.length > 0}
    <!-- Iterate over dealers array with keyed each block for efficient updates -->
    {#each dealers as dealer (dealer._id)}
        <div class="box">
            <div class="columns is-desktop">
                {#if dealer.isEditing}  <!-- If the dealer is in edit mode, display input fields for editing the dealer's information -->
                    <div class="column is-2"><h6 class="has-brand-green">Edit Name</h6><input bind:value={dealer.name} /></div>
                    <div class="column is-2"><h6 class="has-brand-green">Edit Address</h6><textarea bind:value={dealer.address}></textarea></div>
                    <div class="column is-2"><h6 class="has-brand-green">Edit Phone</h6><input bind:value={dealer.phone} /></div>
                    <div class="column is-2"><h6 class="has-brand-green">Edit Email</h6><input bind:value={dealer.email} /></div>
                    <div class="column is-2"><h6 class="has-brand-green">Edit Website</h6><input bind:value={dealer.website} /></div>
                    <div class="column is-1"><h6 class="has-brand-green">Edit Geo Location</h6>
                        <input bind:value={dealer.latitude} />
                        <input bind:value={dealer.longitude} />
                    </div>
                    <div class="column is-1">
                        <button class="button is-fullwidth has-brand-green-background mb-2" onclick={() => saveDealer(dealer._id, dealer)}>Save</button>
                        <button class="button is-fullwidth is-info" onclick={() => toggleEdit(dealer)}>Cancel</button>
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
                        <button class="button is-fullwidth has-deep-red-background mb-2" onclick={() => deleteDealer(dealer._id)}>
                            <i class="fa-solid fa-trash-xmark"></i>&nbsp; Delete
                        </button>
                        <button class="button is-fullwidth has-brand-green-background" onclick={() => { toggleEdit(dealer); dealers = dealers; }}>
                            <i class="fa-sharp fa-solid fa-location-pen"></i>&nbsp; Edit
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    {/each}
{:else}
<!-- Empty state message when no dealers are found -->
<div class="notification is-info">
    No dealers found for this county. Add a dealer to get started.
</div>
{/if}