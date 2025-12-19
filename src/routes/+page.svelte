<script lang="ts">
  import Map from "$lib/ui/maps/Map.svelte";
  import { currentView } from "$lib/runes.svelte";
  import type { PageProps } from "./$types";
  import type { MarkerLayer } from "$lib/ui/maps/map";

  let { data }: PageProps = $props();
  currentView.value = "Home";
</script>

<Map height={85} markerLayers={data.markerLayers as MarkerLayer[]} />
