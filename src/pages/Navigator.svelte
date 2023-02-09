<script lang="ts">
  import { onMount, getContext } from "svelte";
  import LeafletMap from "../components/LeafletMap.svelte";
  import IslandLatLng from "../components/IslandLatLng.svelte";
  import IslandDescription from "../components/IslandDescription.svelte";
  import type { Oileain } from "../services/oileain-api";
  import type { IslandGroup, Island } from "../services/oileain-types";
  import { generateMarkerSpec,generateMarkerLayers } from "../services/oileain-types";
  import type { MarkerLayer } from "../services/markers";

  let oileain: Oileain = getContext("oileain");
  let coasts: Array<IslandGroup>;
  let island: Island;
  let navigator: LeafletMap;
  let markerLayers = Array<MarkerLayer>();

  onMount(async () => {
    coasts = await oileain.getCoasts();
    markerLayers = generateMarkerLayers(coasts);
  });

  function markerSelect(event) {
    oileain.getIslandById(event.detail.marker.id).then((islandSelected) => {
      island = islandSelected;
      navigator.addPopupMarkerAndZoom("selected", generateMarkerSpec(island));
    });
  }
</script>

{#if coasts}
 <div class="columns">
  <div class="column has-text-centered">
      <LeafletMap id="map-main" zoom={7} height={560} {markerLayers} on:message={markerSelect} />
        {#if island}
        <IslandLatLng {island} />
      {/if}
    </div>
    <div class="column">
      <LeafletMap id="map-secondary" height={250} activeLayer="Satellite" bind:this={navigator} />
      {#if island}
          <IslandDescription {island} />
      {/if}
    </div>
  </div>
{/if}
