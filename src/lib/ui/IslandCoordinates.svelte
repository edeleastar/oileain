<script lang="ts">
  let { island } = $props();
</script>

<section class="w-full p-4 text-center">
  <h2 class="mb-2 text-lg font-semibold">GPS-compatible</h2>
  <table class="w-full table-fixed border-collapse border border-gray-300 dark:border-gray-600">
    <tbody>
      <tr class="border-b border-gray-300 even:bg-gray-50 dark:border-gray-600 dark:even:bg-gray-800">
        <td class="w-2/5 border-r border-gray-300 p-2 dark:border-gray-600">Latitude</td>
        <td class="w-3/5 p-2">{island.coordinates.geo.lat}</td>
      </tr>
      <tr class="border-b border-gray-300 even:bg-gray-50 dark:border-gray-600 dark:even:bg-gray-800">
        <td class="w-2/5 border-r border-gray-300 p-2 dark:border-gray-600">Longitude</td>
        <td class="w-3/5 p-2">{island.coordinates.geo.long}</td>
      </tr>
    </tbody>
  </table>
  <h2 class="mt-4 mb-2 text-lg font-semibold">Transverse Mercator</h2>
  <table class="w-full table-fixed border-collapse border border-gray-300 dark:border-gray-600">
    <tbody>
      <tr class="border-b border-gray-300 even:bg-gray-50 dark:border-gray-600 dark:even:bg-gray-800">
        <td class="w-2/5 border-r border-gray-300 p-2 dark:border-gray-600">Eastings</td>
        <td class="w-3/5 p-2">{island.coordinates.tmcGrid.eastings}</td>
      </tr>
      <tr class="border-b border-gray-300 even:bg-gray-50 dark:border-gray-600 dark:even:bg-gray-800">
        <td class="w-2/5 border-r border-gray-300 p-2 dark:border-gray-600">Northings</td>
        <td class="w-3/5 p-2">{island.coordinates.fullIrishGrid.northings}</td>
      </tr>
    </tbody>
  </table>

  <h2 class="mt-4 mb-2 text-lg font-semibold">Full Irish Grid</h2>
  <table class="w-full table-fixed border-collapse border border-gray-300 dark:border-gray-600">
    <tbody>
      <tr class="border-b border-gray-300 even:bg-gray-50 dark:border-gray-600 dark:even:bg-gray-800">
        <td class="w-2/5 border-r border-gray-300 p-2 dark:border-gray-600">Eastings</td>
        <td class="w-3/5 p-2">{island.coordinates.fullIrishGrid.eastings}</td>
      </tr>
      <tr class="border-b border-gray-300 even:bg-gray-50 dark:border-gray-600 dark:even:bg-gray-800">
        <td class="w-2/5 border-r border-gray-300 p-2 dark:border-gray-600">Northings</td>
        <td class="w-3/5 p-2">{island.coordinates.fullIrishGrid.northings}</td>
      </tr>
    </tbody>
  </table>

  <h2 class="mt-4 mb-2 text-lg font-semibold">Irish Grid</h2>
  <table class="w-full table-fixed border-collapse border border-gray-300 dark:border-gray-600">
    <tbody>
      <tr class="border-b border-gray-300 even:bg-gray-50 dark:border-gray-600 dark:even:bg-gray-800">
        <td class="w-2/5 border-r border-gray-300 p-2 dark:border-gray-600">Sheet</td>
        <td class="w-3/5 p-2">{island.coordinates.irishGrid.sheet}</td>
      </tr>
      <tr class="border-b border-gray-300 even:bg-gray-50 dark:border-gray-600 dark:even:bg-gray-800">
        <td class="w-2/5 border-r border-gray-300 p-2 dark:border-gray-600">Eastings</td>
        <td class="w-3/5 p-2">{island.coordinates.irishGrid.eastings}</td>
      </tr>
      <tr class="border-b border-gray-300 even:bg-gray-50 dark:border-gray-600 dark:even:bg-gray-800">
        <td class="w-2/5 border-r border-gray-300 p-2 dark:border-gray-600">Norhtings</td>
        <td class="w-3/5 p-2">{island.coordinates.irishGrid.northings}</td>
      </tr>
    </tbody>
  </table>
</section>
