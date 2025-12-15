<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import LeafletMap from "$lib/ui/LeafletMap.svelte";
  import IslandDescription from "$lib/ui/IslandDescription.svelte";
  import { currentIsland, currentView, markerSelected } from "$lib/runes.svelte";
  import type { MarkerSpec } from "$lib/services/markers";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  let mapTerrain: LeafletMap;
  let mapSat: LeafletMap;
  let mapContext: LeafletMap;
  currentView.value = "Navigator";

  async function zoomTo(marker: MarkerSpec) {
    await mapTerrain?.addPopupMarkerAndZoom("selected", marker);
    await mapSat?.moveTo(marker.location, 14);
    await mapContext?.moveTo(marker.location, 10);
  }

  $effect(() => {
    if (markerSelected.value) {
      currentIsland.value = data.island;
      zoomTo(markerSelected.value);
      goto(`/navigator/${markerSelected?.value?.id}`, { replaceState: true });
    }
  });

  onMount(async () => {
    currentIsland.value = data.island;
    await zoomTo(data.marker);
  });
</script>

<div class="grid grid-cols-2 gap-4">
  <div class="m-2 flex flex-col">
    <div class="m-2 overflow-hidden rounded-lg border">
      <LeafletMap id="terrain" height={40} bind:this={mapTerrain} zoom={14} />
    </div>
    <div class="overflow-y-auto" style="height: 40vh">
      <div class="flex min-h-full items-center justify-center">
        <IslandDescription island={currentIsland?.value} />
      </div>
    </div>
  </div>
  <div class="m-2 flex flex-col">
    <div class="m-2 overflow-hidden rounded-lg border">
      <LeafletMap id="sat" activeLayer="Satellite" height={40} bind:this={mapSat} zoom={14} />
    </div>
    <div class="m-2 overflow-hidden rounded-lg border">
      <LeafletMap id="context" height={40} markerLayers={data.markerLayers} bind:this={mapContext} zoom={12} />
    </div>
  </div>
</div>
