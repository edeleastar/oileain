<script lang="ts">
  import { currentIsland, currentView, markerSelected } from "$lib/runes.svelte";
  import { oileainService } from "$lib/services/oileain-service";
  import { generateMarkerSpec } from "$lib/services/oileain-utils";
  import IslandDescription from "$lib/ui/islandinfo/IslandDescription.svelte";
  import IslandLatLng from "$lib/ui/islandinfo/IslandLatLng.svelte";
  import Map from "$lib/ui/maps/Map.svelte";
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();
  let navigator: Map;

  currentView.value = "Explorer";

  $effect(() => {
    if (markerSelected.value) {
      oileainService.getIslandById(markerSelected.value.id).then((result) => {
        currentIsland.value = result;
        navigator.addPopupMarkerAndZoom("selected", generateMarkerSpec(result));
      });
    }
  });
</script>

<div class="grid grid-cols-2 gap-4">
  <div class="m-2 flex flex-col">
    <div class="m-2 overflow-hidden rounded-lg border">
      <Map id="map-main" zoom={7} height={40} markerLayers={data.markerLayers} />
    </div>
    <div class="overflow-y-auto" style="height: 40vh">
      <div class="flex min-h-full items-center justify-center">
        {#if currentIsland.value}
          <IslandLatLng island={currentIsland.value} />
        {/if}
      </div>
    </div>
  </div>
  <div class="m-2 flex flex-col">
    <div class="m-2 overflow-hidden rounded-lg border">
      <Map id="map-secondary" height={40} activeLayer="Satellite" bind:this={navigator} />
    </div>
    <div class="overflow-y-auto" style="height: 40vh">
      <div class="flex min-h-full items-center justify-center">
        {#if currentIsland.value}
          <IslandDescription island={currentIsland.value} />
        {/if}
      </div>
    </div>
  </div>
</div>
