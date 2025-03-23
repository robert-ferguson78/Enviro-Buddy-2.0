<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AddCarType from './addCarType.svelte';
  import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
  import { messageActions } from '$lib/stores/messages.store.svelte';

  // Convert to props
  let { data } = $props();

  // Use state for carTypes
  let carTypes = $state([]);

// Function to load car types
async function loadCarTypes() {
  // console.log('loadCarTypes function called');
  try {
    // Assuming data.props.userId is available
    const userId = data?.props?.userId;
    // console.log('User ID for loading car types:', userId);
    if (userId) {
      // console.log('Fetching car types for user ID:', userId);
      const fetchedCarTypes = await carTypeFirestoreStore.getCarTypesByBrandId(userId);
      // console.log('Fetched car types:', fetchedCarTypes);

      // Map the fetched car types to include UI state properties
      const mappedCarTypes = fetchedCarTypes.map(carType => ({
        ...carType,
        isEditing: false,
        imageFile: null,
        additionalImagesFiles: [],
        additionalImagesPreviews: carType.additionalImages || []
      }));

      // console.log('Mapped car types:', mappedCarTypes);
      
      // Update the reactive state variable
      carTypes = mappedCarTypes;
      // console.log('carTypes state updated:', carTypes);
    } else {
      console.error('No user ID available for loading car types');
    }
  } catch (error) {
    // console.error('Error loading car types:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

// Initialize carTypes with data
$effect(() => {
  // First create the array without $state
  const mappedCarTypes = (data?.props?.carTypes || []).map(carType => ({
    ...carType,
    isEditing: false,
    imageFile: null,
    additionalImagesFiles: [],
    additionalImagesPreviews: carType.additionalImages || []
  }));

  // Then assign to the reactive state variable
  carTypes = mappedCarTypes;
});

// Function called when a new car type is added
async function addCarType() {
  // changed reloading the page with fetching the updated car types instead
  await loadCarTypes();
  messageActions.showSuccess('Car added successfully!');
}

  async function deleteCarType(id) {
      try {
        // console.log('deleteCarType function called with id:', id);
        await carTypeFirestoreStore.deleteCarTypeById(id);
        // Instead of reloading the page, fetch the updated car types
        await loadCarTypes();
        messageActions.showSuccess('Car type deleted successfully!');
      } catch (error) {
        console.error('Error deleting car type:', error);
        messageActions.showError('Failed to delete car type: ' + error.message);
      }
  }

  async function saveCarType(id, updatedCarType) {
      // Get the image files
      const imageFile = updatedCarType.imageFile;
      const additionalImagesFiles = updatedCarType.additionalImagesFiles;

      // Create a clean copy without UI state properties
      const cleanCarType = { ...updatedCarType };
      delete updatedCarType.imageFile;
      delete updatedCarType.additionalImagesFiles;
      delete updatedCarType.isEditing;
      delete updatedCarType.additionalImagesPreviews;
      delete updatedCarType.imagePreview

      // Prepare the image files array
      const imageFiles = imageFile ? [imageFile] : [];
      const additionalImageFiles = Array.isArray(additionalImagesFiles) ? [...additionalImagesFiles] : [];

      // Update the car type in Firestore
      await carTypeFirestoreStore.updateCarType(id, cleanCarType, imageFiles, additionalImageFiles);
      
      // Instead of reloading the page, fetch the updated car types
      await loadCarTypes();
      messageActions.showSuccess('Car type updated successfully!');
}

  function toggleEdit(carType) {
      carType.isEditing = !carType.isEditing;
  }

  function handleImageChange(event, carType) {
    carType.imageFile = event.target.files[0];
    carType.imagePreview = URL.createObjectURL(event.target.files[0]);
    const preview = document.getElementById(`preview-${carType.id}`);
    if (preview) {
      preview.src = carType.imagePreview;
    }
  }

  function handleAdditionalFilesChange(event, carType) {
    // Replace old image files with new ones
    carType.additionalImagesFiles = Array.from(event.target.files);
    carType.additionalImagesPreviews = carType.additionalImagesFiles.map((file) => URL.createObjectURL(file));
    // No need for carTypes = carTypes.slice() in Svelte 5
  }
</script>

<UpdateHead title="Car Types" description="Driving your Electric Dreams Today" />

<section class="section">
  <AddCarType on:add={addCarType} />
</section>

<div class="columns is-multiline">
  {#each carTypes as carType (carType.id)}
    {#if carType.isEditing}
    <div class="column is-one-third">
      <div class="box box-link-hover-shadow">
        <h5>Edit Car Name<br/><input bind:value={carType.carName} /></h5>
          <h5>Edit Car Type<br/><input bind:value={carType.carType} /></h5>
          <h5>Edit Car Range<br/><input bind:value={carType.carRange} /></h5>
          <h6>Edit Image</h6>
          <input type="file" accept="image/*" onchange={(event) => handleImageChange(event, carType)} />
          {#if carType.image}
              <img id={`preview-${carType.id}`} src={carType.image}/>
          {/if}
          <div class="control pt-5">
            <div class="file has-name">
              <label class="file-label">
                <input class="file-input" type="file" name="additionalImages" onchange={(event) => handleAdditionalFilesChange(event, carType)} multiple/>
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
              <div class="additional-previews">
                {#each carType.additionalImagesPreviews as preview, index (preview)}
                  <img id={`additional-preview-${carType.id}-${index}`} src={preview} alt={`Additional Image ${index + 1}`} />
                {/each}
              </div>
            </div>
          </div>
          <button class="button is-fullwidth has-brand-green-background" onclick={() => saveCarType(carType.id, carType)}>Save</button>
          <button class="button is-fullwidth info" onclick={() => toggleEdit(carType)}>Cancel</button>
      </div>
    </div>
      {:else}
      <div class="column is-one-third">
          <div class="box box-link-hover-shadow">
              <h2 class="title">
                  {carType.carName}
              </h2>
              <img src={carType.image} alt={carType.carName}/>
              <h3 class="subtitle">
                  Car Type: {carType.carType}<br/>
                  Car Range: {carType.carRange}
              </h3>
              <button class="button is-fullwidth has-brand-green-background" onclick={() => toggleEdit(carType)}>
                <i class="fa-sharp fa-solid fa-location-pen"></i><span class="pl-3">Edit</span>
              </button>
              <button class="button is-fullwidth has-deep-red-background" onclick={() => deleteCarType(carType.id)}>
                  <i class="fa-solid fa-trash-xmark"></i><span class="pl-3">Delete</span>
              </button>
          </div>
      </div>
      {/if}
    {/each}
  </div>

<style>
.column input {
  border: solid 1px grey;
  padding: 5px 8px;
}
.button {
  margin-bottom: 10px;
}
</style>