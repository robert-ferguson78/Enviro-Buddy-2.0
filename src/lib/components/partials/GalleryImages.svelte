<script>
    import { onMount } from 'svelte'; // Import onMount
    export let carTypes = []; // Accept carTypes as a prop
    import ImageGallery from '@react2svelte/image-gallery';

    let carData = []; // Initialize carData
    let selectedCar = null; // Initialize selectedCar
    let imageUrls = []; // Initialize imageUrls

    // Whenever carTypes changes, update carData
    $: if (carTypes && carTypes.length > 0) {
        carData = carTypes.map(carType => {
            let images = [];
            if (carType.additionalImages) {
                images = carType.additionalImages.map(image => ({
                    original: image,
                    thumbnail: image
                }));
            }
            return { carName: carType.carName, images, carImage: carType.image };
        });
    }

    // Function to handle click on a car
    function handleClick(car) {
    // console.log('Selected car:', car);  // Log the selected car
    selectedCar = car;
    imageUrls = selectedCar.images; // Assign images object to imageUrls
    // console.log('Image URLs:', imageUrls);  // Log the image URLs
}
</script>

<!-- Use #each block to loop over carData and display the name and image -->
<div class="box">
    <h2 class="subtitle has-text-centered">Select Dealer on Map for Car Models</h2>
    <div class="columns">
        {#each carData as car (car.carName)}
            <div class="column">
                <h2>{car.carName}</h2>
                <img src={car.carImage} on:click={() => handleClick(car)}>
            </div>
        {/each}
    </div>

    <!-- Display ImageGallery for selected car -->
    {#if selectedCar}
        <ImageGallery items={imageUrls} />
    {/if}
</div>