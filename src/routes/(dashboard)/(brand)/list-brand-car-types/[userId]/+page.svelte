<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AddCarType from './addCarType.svelte';
  import { carTypeFirestoreStore } from '$lib/firebase/models/car-type-firestore-store';
  export let data;
  let carTypes = data?.props?.carTypes || [];

  carTypes = carTypes.map(carType => ({ ...carType, isEditing: false, imageFile: null }));

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
    // Get the image file
    const imageFile = updatedCarType.imageFile;
    // Remove the imageFile and isEditing properties
    delete updatedCarType.imageFile;
    delete updatedCarType.isEditing;

    // Update the car type in Firestore
    await carTypeFirestoreStore.updateCarType(id, updatedCarType, imageFile);
    location.reload();
  }

  function toggleEdit(carType) {
      carType.isEditing = !carType.isEditing;
      carTypes = carTypes.slice(); // This creates a new array, triggering a re-render
  }

  function handleImageChange(event, carType) {
      carType.imageFile = event.target.files[0];
      carType.image = URL.createObjectURL(event.target.files[0]);
      const preview = document.getElementById(`preview-${carType.id}`);
      if (preview) {
          preview.src = carType.image;
      }
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