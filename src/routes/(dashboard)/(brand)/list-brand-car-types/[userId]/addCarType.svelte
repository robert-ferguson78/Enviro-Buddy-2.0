<script lang="ts">
  import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
  import { getUser } from '$lib/firebase/models/user-firestore.store';
  import messagesStore from '$lib/stores/messages.store';
  import authStore from '$lib/stores/auth.store';
  import { createEventDispatcher } from 'svelte';

  let user;
  let carName = '';
  let carRange = '';
  let carType = '';
  let image;

  let defaultImage = '/images/enviro-buddy-image-preview.jpg';

  const dispatch = createEventDispatcher();

  const unsubscribe = authStore.subscribe(async value => {
    if (value && value.isLoggedIn && value.userId) {
      user = await getUser(value.userId);
    } else {
      user = null;
    }
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
      userId: user.user_id // include the userId in the carTypeObject
    };

    // Add the car type to the Firestore database
    try {
      await carTypeFirestoreStore.createCarType(carTypeObject);
      messagesStore.showSuccess('Car added sucessfully!');
      dispatch('add'); // Dispatch 'add' event here
    } catch (error) {
      console.error('Error adding car type:', error);
      messagesStore.showError('Car not added, please contact support!');
    }

    console.log({ carName, carRange, carType, image, userId: user.user_id });
  }

  function handleFileChange(event) {
    image = event.target.files[0];
    const preview = document.getElementById('preview');
    preview.src = URL.createObjectURL(image);
  }
</script>

<h1 class="title">Upload Electric Vehicle</h1>
<form id="upload-form" on:submit|preventDefault={uploadVehicle}>
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
            <input class="file-input" type="file" name="image" on:change={handleFileChange}>
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
  <div class="columns">
    <div class="column is-full">
      <input class="button is-link" type="submit" value="Upload Vehicle">
    </div>
  </div>
</form>