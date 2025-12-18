<script lang="ts">
  let { island } = $props();
</script>

<section class="w-full p-4 text-center">
  <h2 class="mb-2 text-lg font-semibold">GPS-compatible</h2>
  <div class="table-wrap">
    <table class="table">
      <tbody class="[&>tr]:hover:preset-tonal-primary">
        <tr>
          <td class="w-2/5 border-r border-surface-200-800 p-2">Latitude</td>
          <td class="w-3/5 p-2">{island.coordinates.geo.lat}</td>
        </tr>
        <tr>
          <td class="w-2/5 border-r border-surface-200-800 p-2">Longitude</td>
          <td class="w-3/5 p-2">{island.coordinates.geo.long}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h2 class="mt-4 mb-2 text-lg font-semibold">Transverse Mercator</h2>
  <div class="table-wrap">
    <table class="table">
      <tbody class="[&>tr]:hover:preset-tonal-primary">
        <tr>
          <td class="w-2/5 border-r border-surface-200-800 p-2">Eastings</td>
          <td class="w-3/5 p-2">{island.coordinates.tmcGrid.eastings}</td>
        </tr>
        <tr>
          <td class="w-2/5 border-r border-surface-200-800 p-2">Northings</td>
          <td class="w-3/5 p-2">{island.coordinates.fullIrishGrid.northings}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2 class="mt-4 mb-2 text-lg font-semibold">Full Irish Grid</h2>
  <div class="table-wrap">
    <table class="table">
      <tbody class="[&>tr]:hover:preset-tonal-primary">
        <tr>
          <td class="w-2/5 border-r border-surface-200-800 p-2">Eastings</td>
          <td class="w-3/5 p-2">{island.coordinates.fullIrishGrid.eastings}</td>
        </tr>
        <tr>
          <td class="w-2/5 border-r border-surface-200-800 p-2">Northings</td>
          <td class="w-3/5 p-2">{island.coordinates.fullIrishGrid.northings}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2 class="mt-4 mb-2 text-lg font-semibold">Irish Grid</h2>
  <div class="table-wrap">
    <table class="table">
      <tbody class="[&>tr]:hover:preset-tonal-primary">
        <tr>
          <td class="w-2/5 border-r border-surface-200-800 p-2">Sheet</td>
          <td class="w-3/5 p-2">{island.coordinates.irishGrid.sheet}</td>
        </tr>
        <tr>
          <td class="w-2/5 border-r border-surface-200-800 p-2">Eastings</td>
          <td class="w-3/5 p-2">{island.coordinates.irishGrid.eastings}</td>
        </tr>
        <tr>
          <td class="w-2/5 border-r border-surface-200-800 p-2">Norhtings</td>
          <td class="w-3/5 p-2">{island.coordinates.irishGrid.northings}</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
