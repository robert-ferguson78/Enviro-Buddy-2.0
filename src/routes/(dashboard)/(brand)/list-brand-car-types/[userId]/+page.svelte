<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AddCarType from './addCarType.svelte';
  import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
  export let data;
  let carTypes = data?.props?.carTypes || [];
  // let additionalImages = []

  carTypes = carTypes.map(carType => ({
    ...carType, 
    isEditing: false, 
    imageFile: null, 
    additionalImagesFiles: [], 
    additionalImagesPreviews: carType.additionalImages || [] // Initialize with original images
  }));
  
  function addCarType() {
      console.log('addCarType function called');
      setTimeout(() => {
          location.reload();
      }, 1000);
  }

  async function deleteCarType(id) {
      console.log('deleteCarType function called with id:', id);
      await carTypeFirestoreStore.deleteCarTypeById(id);
      console.log('Car type deleted');
      location.reload();
  }

  async function saveCarType(id, updatedCarType) {
      // Get the image files
      const imageFile = updatedCarType.imageFile;
      const additionalImagesFiles = updatedCarType.additionalImagesFiles;

      // Remove the imageFile, additionalImagesFiles and isEditing properties
      delete updatedCarType.imageFile;
      delete updatedCarType.additionalImagesFiles;
      delete updatedCarType.isEditing;
      delete updatedCarType.additionalImagesPreviews;
      delete updatedCarType.imagePreview

      // Prepare the image files array
      const imageFiles = imageFile ? [imageFile] : [];
      const additionalImageFiles = Array.isArray(additionalImagesFiles) ? [...additionalImagesFiles] : [];

      // Update the car type in Firestore
      await carTypeFirestoreStore.updateCarType(id, updatedCarType, imageFiles, additionalImageFiles);
      location.reload();
  }

  function toggleEdit(carType) {
      carType.isEditing = !carType.isEditing;
      carTypes = carTypes.slice();
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
    carType.additionalImagesPreviews = carType.additionalImagesFiles.map(file => URL.createObjectURL(file));
    carTypes = carTypes.slice(); // Add this line to trigger reactivity
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
          <input type="file" accept="image/*" on:change={(event) => handleImageChange(event, carType)} />
          {#if carType.image}
              <img id={`preview-${carType.id}`} src={carType.image}/>
          {/if}
          <div class="control pt-5">
            <div class="file has-name">
              <label class="file-label">
                <input class="file-input" type="file" name="additionalImages" on:change={(event) => handleAdditionalFilesChange(event, carType)} multiple>
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
          <button on:click={() => saveCarType(carType.id, carType)}>Save</button>
          <button on:click={() => toggleEdit(carType)}>Cancel</button>
      </div>
    </div>
      {:else}
      <div class="column is-one-third">
          <div class="box box-link-hover-shadow">
              <h2 class="title">
                  {carType.carName}
              </h2>
              <img src={carType.image} alt={carType.carName}>
              <h3 class="subtitle">
                  Car Type: {carType.carType}<br/>
                  Car Range: {carType.carRange}
              </h3>
              <a href={`/cartype/${carType.id}`} class="button">
                  <span class="icon is-small">
                      <i class="fa-sharp fa-solid fa-location-pen"></i>
                  </span>
              </a>
              <button class="button" on:click={() => deleteCarType(carType.id)}>
                  <i class="fa-solid fa-trash-xmark"></i>
              </button>
              <button on:click={() => toggleEdit(carType)}>Edit</button>
          </div>
      </div>
      {/if}
    {/each}
  </div>