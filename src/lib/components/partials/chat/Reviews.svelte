<script>
import { onMount, onDestroy } from 'svelte';
import { reviewsFirestoreStore } from '$lib/firebase/models/reviews-firestore-store';
import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
import auth from '$lib/stores/auth.store';


// recactored from 'export let' to using $props() rune for props
const { dealerId } = $props();

// refactored regular variables to $state variables
let user = $state(null);
let reviews = $state([]);
let newMessage = $state('');
let userName = $state('');
let userId = $state('');
let unsubscribe = $state(null);

// Subscribe to the auth store to get the current user
auth.subscribe(value => {
    user = value;
// console.log('user object:', user);
});

// When the component mounts
onMount(async () => {
    // If the user is logged in, get their details
    if (user && user.userId) {
        let userdetails = await userFirestoreStore.getUser(user.userId);
        userName = userdetails.name;
        userId = user.userId;
    }

    // Check if the dealer exists
    const dealerExists = await reviewsFirestoreStore.checkForDealer(dealerId);
    if (dealerExists) {
        // If the dealer exists, get real-time updates of their reviews
        unsubscribe = reviewsFirestoreStore.getReviewsRealtime(dealerId, (newReviews) => {
            // Filter out reviews without a timestamp and sort them by timestamp
            reviews = newReviews
                .filter(review => review.timestamp) // filter out reviews without a timestamp
                .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        });
    } else {
        reviews = ['No reviews yet, be the first to add a review'];
    }
});

// When the component is destroyed
onDestroy(() => {
    // If there's a real-time listener set up, unsubscribe from it
    if (unsubscribe) {
        unsubscribe();
    }
});

// Function to add a review
async function addReview() {
    // Create a new review in the Firestore database
    await reviewsFirestoreStore.createReview(dealerId, userId, userName, newMessage);
    // Clear the new message input
    newMessage = '';
}
</script>

<!-- HTML and Svelte markup for the component -->
<div class="box review-ctn" class:loggedin={user && user.userId}>
    <h2 class="title">Customer Reviews</h2>
    {#if user && user.userId}
        <input class="input is-rounded" bind:value={newMessage} placeholder="Add a review" />
        <button class="button is-normal mt-3 mb-3 has-brand-green-background start-chat-button is-fullwidth" onclick={addReview}>Submit</button><!-- refcatored from 'on:click' to 'onclick' attribute -->
    {:else}
        <div class="box has-brand-green-background">
            <p>Please <a href="/login"><u>login</u></a> / <a href="/signup"><u>Register</u></a> to add a review</p>
        </div>
    {/if}
    
    {#each reviews as review (review.id)}
    <div class="box">
            <p>{review.message}</p>
            <h5 class="is-size-7">{review.userName}: @ {new Date(review.timestamp?.toDate()).toLocaleString()}</h5>
        </div>
    {/each}
</div>

<!-- CSS for the component -->
<style>
    .review-ctn {
        max-height: 590px;
        overflow: scroll;
        overflow-x: hidden;
    }
    .review-ctn.loggedin {
        max-height: 575px;
    }
    .review-ctn .box  {
        background-color: rgba(4, 159, 98, 0.1);
    }
    .review-ctn .box.has-brand-green-background {
        background-color: #066f64;
    }
</style>