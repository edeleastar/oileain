<script lang="ts">
  let { island } = $props();
</script>

<section class="w-full p-4 text-center">
  <h1 class="mb-4 text-2xl font-bold">{@html island.name}</h1>
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
</section>
