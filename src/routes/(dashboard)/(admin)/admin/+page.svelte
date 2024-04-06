<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
</script>

<UpdateHead title="Admin Dashboard" description="Driving your Electric Dreams Today" />

<section class="section">
  <div class="box">
    <div class="block">
      <h1 class="title">Manage Brand Users</h1>
    </div>
    <div class="block">
        <table class="table is-fullwidth">
        <thead>
            <tr>
            <th>Contact Name</th>
            <th>Brand</th>
            <th>Contact Email</th>
            <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                name
                </td>
                <td>
                brand name
                </td>
                <td>
                email
                </td>
                <td>
                <a href="/brandcounties/user_id" class="ui icon button">
                  <i class="fa-solid fa-eye"></i>
                </a>
                <a href="/removeuser/user_id" class="ui icon button">
                    <i class="fa-solid fa-trash-xmark"></i>
                </a>
                </td>
            </tr>
        </tbody>
        </table>
    </div>
  </div>
  <div class="box">
    <div class="block">
      <h1 class="title">Manage Viewer Users</h1>
    </div>
    <div class="block">
        <table class="table is-fullwidth">
        <thead>
            <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>EMAIL</th>
            <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                first name
                </td>
                <td>
                last name
                </td>
                <td>
                email
                </td>
                <td>
                <a href="/user/profile/user_id" class="ui icon button">
                  <i class="fa-solid fa-eye"></i>
                </a>
                <a href="/removeuser/user_id" class="ui icon button">
                  <i class="fa-solid fa-trash-xmark"></i>
                </a>
                </td>
            </tr>
        </tbody>
        </table>
    </div>
  </div>
    <div class="box">
    <h1 class="title">Uploads by Car Brand a</h1>
        <div class="columns">
            <div class="column is-one-third">
                <div class="box box-link-hover-shadow">
                    <p class="title">brand name</p>
                    <p class="subtitle">"Number" Dealers<br/>
                    "Number" Car Types<br/>
                    "Number" Counties<br/><br/>
                    <b>County with Most Dealers:</b><br>
                    county amane - "Number" Dealers</p>
                </div>
            </div>
        </div>
    </div> 
</section>