<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
</script>

<UpdateHead title="Dashboard" description="Driving your Electric Dreams Today" />

<section class="section">
  <div class="box">
    <div class="block">
      <p>Mange all Offical dealers of your car brand here by Selcting counties to add. Then group all your dealerships together under these counties</p>
    </div>
    <div class="block">
      <a href="/counties" class="button is-info">
        Manage Counties and Dealerships
      </a>
    </div>
  </div>
  <div class="box">
    <div class="block">
      <p>Mange all your Electric car models in one place which will be available to all your Offical dealerships automatically</p>
    </div>
    <div class="block">
      <a href="/cartype" class="button is-info">
        Manage Car Types
      </a>
    </div>
  </div>
</section>
