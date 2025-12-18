<script lang="ts">
  import IslandCoordinates from "$lib/ui/IslandCoordinates.svelte";
  import IslandDescription from "$lib/ui/IslandDescription.svelte";
  import LeafletMap from "$lib/ui/maps/LeafletMap.svelte";
  import { currentIsland, currentView } from "$lib/runes.svelte";
  import type { PageProps } from "./$types";
  import { oileainService } from "$lib/services/oileain-service";
  import { generateMarkerSpec } from "$lib/services/oileain-utils";
  import { page } from "$app/state";

  let { data }: PageProps = $props();
  let mapTerrain: LeafletMap;

  // svelte-ignore state_referenced_locally
  currentIsland.value = data.island;
  currentView.value = "Wanderer";

  $effect(() => {
    oileainService.getIslandById(page.params.id).then((result) => {
      currentIsland.value = data.island;
      mapTerrain?.addPopupMarkerAndZoom("selected", generateMarkerSpec(result));
    });
  });
</script>

<div class="grid grid-cols-2 gap-4">
  <div class="m-2 flex flex-col">
    <div class="m-2 overflow-hidden rounded-lg border">
      <LeafletMap id="map-main" marker={data.marker} zoom={7} height={40} bind:this={mapTerrain} />
    </div>
    <div class="overflow-y-auto" style="height: 40vh">
      <div class="flex min-h-full items-center justify-center">
        <IslandCoordinates island={currentIsland?.value} />
      </div>
    </div>
  </div>
  <div class="m-2 flex flex-col">
    <div class="h-full overflow-y-auto">
      <IslandDescription island={currentIsland?.value} />
    </div>
  </div>
</div>
