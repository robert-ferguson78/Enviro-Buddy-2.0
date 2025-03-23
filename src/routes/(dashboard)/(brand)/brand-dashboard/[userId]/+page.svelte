<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
  import authStore from '$lib/stores/auth.store';
  
  // Use $state for reactive variables
  let userId = $state(null);
  
  // Convert subscription to $effect
  $effect(() => {
    // Subscribe to the authStore
    const unsubscribe = authStore.subscribe(value => {
      userId = value.userId;
    });
    
    // Return cleanup function
    return unsubscribe;
  });
</script>

<UpdateHead title="Dashboard" description="Driving your Electric Dreams Today" />

<section class="section">
  <div class="box">
    <div class="block">
      <p>Mange all Offical dealers of your car brand here by Selcting counties to add. Then group all your dealerships together under these counties</p>
    </div>
    <div class="block">
      <a href={`/list-brand-counties/${userId}`} class="button is-info">
        Manage Counties and Dealerships
      </a>
    </div>
  </div>
  <div class="box">
    <div class="block">
      <p>Mange all your Electric car models in one place which will be available to all your Offical dealerships automatically</p>
    </div>
    <div class="block">
      <a href={`/list-brand-car-types/${userId}`} class="button is-info">
        Manage Car Types
      </a>
    </div>
  </div>
</section>
