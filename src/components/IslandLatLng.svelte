<script lang="ts">
  import type { Island } from "../services/oileain-types";
  export let island: Island;
</script>


<section class="section">
  <h1 class="title">{island.name}</h1>
  <h2 class="subtitle">
    GPS-compatible
  </h2>
<div>
  <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
    <tbody>
      <tr>
        <td>Latitude</td>
        <td>{island.coordinates.geo.lat}</td>
      </tr>
      <tr>
        <td>Longitude</td>
        <td>{island.coordinates.geo.long}</td>
      </tr>
    </tbody>
  </table>
</div>
</section>
