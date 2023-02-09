<script lang="ts">
  import type {Island} from "../services/oileain-types";

  export let island: Island;
</script>

<section class="section has-text-centered">
      <h2 class="subtitle">
        GPS-compatible
      </h2>
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
  <h2 class="subtitle">
      Transverse Mercator
    </h2>
      <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        <tbody>
          <tr>
            <td>Eastings</td>
            <td>{island.coordinates.tmcGrid.eastings}</td>
          </tr>
          <tr>
            <td>Northings</td>
            <td>{island.coordinates.fullIrishGrid.northings}</td>
          </tr>
        </tbody>
      </table>

<h2 class="subtitle">
      Full Irish Grid</h2>
      <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        <tbody>
          <tr>
            <td>Eastings</td>
            <td>{island.coordinates.fullIrishGrid.eastings}</td>
          </tr>
          <tr>
            <td>Northings</td>
            <td>{island.coordinates.fullIrishGrid.northings}</td>
          </tr>
        </tbody>
      </table>

  <h2 class="subtitle">
    Irish Grid</h2>
      <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        <tbody>
          <tr>
            <td>Sheet</td>
            <td>{island.coordinates.irishGrid.sheet}</td>
          </tr>
          <tr>
            <td>Eastings</td>
            <td>{island.coordinates.irishGrid.eastings}</td>
          </tr>
          <tr>
            <td>Norhtings</td>
            <td>{island.coordinates.irishGrid.northings}</td>
          </tr>
        </tbody>
      </table>
</section>