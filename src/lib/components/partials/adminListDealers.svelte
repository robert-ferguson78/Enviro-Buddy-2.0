<script>
	import Layout from "../routes/+layout.svelte";

</script>
<table class="table is-fullwidth">
    <thead>
      <tr>
        <th>Name</th>
        <th>Address</th>
        <th>Phone</th>
        <th>Email</th>
        <th>Website</th>
        <th>Geo Location</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
        <tr>
          <td>
            Name
          </td>
          <td>
            Address
          </td>
          <td>
            Phone
          </td>
          <td>
            Email
          </td>
          <td>
            Website
          </td>
          <td>
            Lat
            Long
          </td>
          <td>
            <a href="/dealer/county_id/editdealer/id" class="ui icon button">
              <i class="fa-solid fa-pen-to-square"></i>
            </a>
            <a href="/county/county_id/deletedealer/id" class="ui icon button">
              <i class="fa-solid fa-trash-xmark"></i>
            </a>
          </td>
        </tr>
    </tbody>
  </table>