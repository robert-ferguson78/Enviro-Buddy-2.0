<script>
  import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
  import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
  import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
  import authStore from '$lib/stores/auth.store';
  import { createEventDispatcher } from 'svelte';

  // Use $state for reactive variables
  let user = $state(null);
  let carName = $state('');
  let carRange = $state('');
  let carType = $state('');
  let image = $state(null);


  let defaultImage = '/images/enviro-buddy-image-preview.jpg';
  let additionalImages = $state([]);
  let additionalImagePreviews = $state([]);

  const dispatch = createEventDispatcher();

  // Use $effect for subscription
  $effect(() => {
    const unsubscribe = authStore.subscribe(async value => {
      if (value && value.isLoggedIn && value.userId) {
        user = await userFirestoreStore.getUser(value.userId);
      } else {
        user = null;
      }
    });
    
    // Return cleanup function
    return unsubscribe;
  });

  async function uploadVehicle(event) {
    event.preventDefault();
    // Check if user is defined
    if (!user) {
        console.error('User is not defined');
        return;
    }

    // Create a car type object
    const carTypeObject = {
      carName,
      carRange,
      carType,
      image,
      additionalImages,
      userId: user.user_id // include the userId in the carTypeObject
    };

    // Add the car type to the Firestore database
    try {
      await carTypeFirestoreStore.createCarType(carTypeObject);
        messageActions.showSuccess('Car added sucessfully!');
        // console.log('Dispatching add event');
        dispatch('add'); // Dispatch 'add' event here
        
        // Reset form fields after successful upload
        carName = '';
        carRange = '';
        carType = '';
        image = null;
        additionalImages = [];
        additionalImagePreviews = [];
      } catch (error) {
        console.error('Error adding car type:', error);
        messageActions.showError('Car not added, please contact support!');
      }

    // console.log({ carName, carRange, carType, image, additionalImages, userId: user.user_id });
  }

  // Function to handle the change event of the main image file input
  function handleFileChange(event) {
    image = event.target.files[0]; // Get the first file from the file input
  }

  // Function to handle the change event of the additional images file input
  function handleAdditionalFilesChange(event) {
    // Get all files from the file input
    additionalImages = Array.from(event.target.files);
    
    // Create preview URLs for each image
    additionalImagePreviews = additionalImages.map(file => URL.createObjectURL(file));
  }
</script>

<!-- refcatored from 'on:submit|preventDefault' to 'onsubmit' with preventDefault in the handler and similar -->
<h1 class="title">Upload Electric Vehicle</h1>
<form id="upload-form" onsubmit={uploadVehicle}>
  <div class="columns">
    <div class="column is-two-third">
      <div class="control">
        <label class="label" for="carName">Enter Car Name</label>
        <input class="input is-normal" type="text" bind:value={carName} name="carName" placeholder="Car Name">
      </div>
      <div class="control">
        <label class="label" for="carRange">Enter Car Range in KM</label>
        <input class="input is-normal" type="text" bind:value={carRange} name="carRange" placeholder="Car Range">
      </div>
      <div class="control">
        <label class="label" for="carType">Select Car Body Type</label>
        <select class="input is-normal" bind:value={carType} name="carType">
          <option value="">Select Car Type</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Saloon">Saloon</option>
          <option value="Estate">Estate</option>
          <option value="MPV">MPV</option>
          <option value="SUV">SUV</option>
          <option value="Coupe">Coupe</option>
          <option value="Convertible">Convertible</option>
        </select>
      </div>
      <div class="control pt-5">
        <div class="file has-name">
          <label class="file-label">
            <input class="file-input" type="file" name="image" onchange={handleFileChange}>
            <span class="file-cta">
              <span class="file-icon">
                <i class="fas fa-upload"></i>
              </span>
              <span class="file-label">
                Choose a Vehicle Image…
              </span>
            </span>
            <span class="file-name">
              Image Name
            </span>
          </label>
        </div>
      </div>
    </div>
    <div class="column is-one-third">
      <div class="control">
        <label class="label" for="preview">Image Preview</label>
        <img id="preview" src={image ? URL.createObjectURL(image) : defaultImage} alt="Vehicle Preview" />
      </div>
    </div>
  </div>
  <div class="control pt-5">
    <div class="file has-name">
      <label class="file-label">
        <input class="file-input" type="file" name="additionalImages" onchange={handleAdditionalFilesChange} multiple>
        <span class="file-cta">
          <span class="file-icon">
            <i class="fas fa-upload"></i>
          </span>
          <span class="file-label">
            Choose Additional Vehicle Images…
          </span>
        </span>
        <span class="file-name">
          Additional Image Names
        </span>
      </label>
    </div>
  </div>
  <div class="column is-one-third">
    <div class="additional-previews">
      {#each additionalImages as image, index (image)}
        <img id={`additional-preview-${index}`} src={URL.createObjectURL(image)} alt={`Additional Image ${index + 1}`} />
      {/each}
    </div>
  </div>
  <div class="columns">
    <div class="column is-full">
      <input class="button is-link" type="submit" value="Upload Vehicle">
    </div>
  </div>
</form>