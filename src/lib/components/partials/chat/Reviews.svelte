<script>
import { onMount } from 'svelte';
import { reviewsFirestoreStore } from '$lib/firebase/models/reviews-firestore-store';
import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
import auth from '$lib/stores/auth.store';

let user;
    auth.subscribe(value => {
    user = value;
    // console.log('user object:', user);
});

export let dealerId;
let reviews = [];
let newMessage = '';
let userName;
let userId;

onMount(async () => {
    if (user && user.userId) {
        let userdetails = await userFirestoreStore.getUser(user.userId);
        userName = userdetails.name;
        // console.log('user name here:', userName);
        userId = user.userId;
        // console.log('user Id here:', userId);
    }

    const dealerExists = await reviewsFirestoreStore.checkForDealer(dealerId);
    if (dealerExists) {
        const unsubscribe = reviewsFirestoreStore.getReviewsRealtime(dealerId, (newReviews) => {
            reviews = newReviews
                .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        });
        return unsubscribe;
    } else {
        reviews = ['No reviews yet, be the first to add a review'];
    }
});

async function addReview() {
    await reviewsFirestoreStore.createReview(dealerId, userId, userName, newMessage);
    newMessage = '';
}
</script>

<div class="box review-ctn" class:loggedin={user && user.userId}>
    <h2 class="title">Customer Reviews</h2>
    {#if user && user.userId}
        <input class="input is-rounded" bind:value={newMessage} placeholder="Add a review" />
        <button class="button is-normal mt-3 mb-3 has-brand-green-background start-chat-button is-fullwidth" on:click={addReview}>Submit</button>
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

<style>
    .review-ctn {
        max-height: 575px;
        overflow: scroll;
        overflow-x: hidden;
    }
    .review-ctn.loggedin {
        max-height: 575px;
    }
</style>