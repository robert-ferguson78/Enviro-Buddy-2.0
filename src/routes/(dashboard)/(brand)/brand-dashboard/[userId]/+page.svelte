<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
  import authStore from '$lib/stores/auth.store';

  let userId;

  // Subscribe to the authStore
  // When the authStore's value changes, update the userId variable
  const unsubscribe = authStore.subscribe(value => {
    userId = value.userId;
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
