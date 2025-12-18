<script lang="ts">
  import LeafletMap from "$lib/ui/maps/LeafletMap.svelte";
  import { currentView } from "$lib/runes.svelte";
  import type { PageProps } from "./$types";
  import type { MarkerLayer } from "$lib/services/markers";
  let { data }: PageProps = $props();
  currentView.value = "Home";
</script>

<LeafletMap height={85} markerLayers={data.markerLayers as MarkerLayer[]} />
