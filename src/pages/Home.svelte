<script lang="ts">
  import { onMount, getContext } from "svelte";
  import LeafletMap from "../components/LeafletMap.svelte";
  import type { Oileain } from "../services/oileain-api";
  import type { IslandGroup} from "../services/oileain-types";
  import { generateMarkerLayers } from "../services/oileain-types";
  import type { MarkerLayer } from "../services/markers";

  let oileain: Oileain = getContext("oileain");
  let coasts: Array<IslandGroup> = null;
  let markerLayers = Array<MarkerLayer>();

  onMount(async () => {
    // retrieve shallow version of all islands (divided into coasts)
    coasts = await oileain.getCoasts();
    // create a set of Leaflet layers - one for each coast (island group)
    // these are sent to the LeafletMap and will be rendered (along with layer control to selectively disable)
    markerLayers = generateMarkerLayers(coasts);
  });
</script>

{#if coasts}
  <LeafletMap height={800} {markerLayers} />
{/if}
