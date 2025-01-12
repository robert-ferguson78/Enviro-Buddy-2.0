<script>
    export let carTypes = [];
    let carData = [];
    let selectedCar = null;
    let currentImageIndex = 0;
    let imageUrls = [];
  
    $: if (carTypes?.length > 0) {
      carData = carTypes.map(carType => ({
        carName: carType.carName,
        images: carType.additionalImages || [],
        carImage: carType.image
      }));
    }
  
    function handleCarSelect(car) {
      selectedCar = car;
      imageUrls = [car.carImage, ...car.images];
      currentImageIndex = 0;
    }
  
    function nextImage() {
      currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
    }
  
    function previousImage() {
      currentImageIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
    }
  </script>
  
  <div class="box">
    <h2 class="subtitle has-text-centered">Select Dealer on Map for Car Models</h2>
    <div class="columns is-multiline">
      {#each carData as car (car.carName)}
        <div class="column is-one-third">
          <div class="card">
            <div class="card-content">
              <h3 class="title is-5">{car.carName}</h3>
              <button 
                class="image-button"
                on:click={() => handleCarSelect(car)}
                on:keydown={(e) => e.key === 'Enter' && handleCarSelect(car)}
              >
                <img src={car.carImage} alt={`${car.carName} preview`} class="car-thumbnail">
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  
    {#if selectedCar && imageUrls.length > 0}
      <div class="gallery-container">
        <button 
          class="gallery-nav prev"
          on:click={previousImage}
          aria-label="Previous image"
        >
          ←
        </button>
        
        <div class="gallery-image">
          <img 
            src={imageUrls[currentImageIndex]} 
            alt={`${selectedCar.carName} view ${currentImageIndex + 1} of ${imageUrls.length}`}
          >
        </div>
        
        <button 
          class="gallery-nav next"
          on:click={nextImage}
          aria-label="Next image"
        >
          →
        </button>
      </div>
    {/if}
  </div>
  
  <style>
    .image-button {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      width: 100%;
      transition: transform 0.2s;
    }
  
    .image-button:focus {
      outline: 2px solid #4CAF50;
      border-radius: 4px;
    }
  
    .image-button:hover {
      transform: scale(1.05);
    }
  
    .car-thumbnail {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 4px;
    }
  
    .gallery-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2rem;
      gap: 1rem;
    }
  
    .gallery-image {
      width: 100%;
      max-width: 800px;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    .gallery-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  
    .gallery-nav {
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      padding: 1rem;
      cursor: pointer;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
  
    .gallery-nav:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  
    .gallery-nav:focus {
      outline: 2px solid #4CAF50;
    }
  </style>
  