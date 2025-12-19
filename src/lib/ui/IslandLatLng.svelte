<script lang="ts">
  let { island } = $props();
</script>

<section class="w-full p-4 text-center">
  <h1 class="mb-4 text-2xl font-bold">{@html island.name}</h1>
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
</section>
