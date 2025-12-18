<script lang="ts">
  import LeafletMap from "./LeafletMap.svelte";
  import { mapProvider } from "$lib/runes.svelte";
  import type { MarkerLayer, MarkerSpec } from "../../services/markers";
  import type { LatLng } from "leaflet";

  let {
    id = "home-map-id",
    height = 80,
    location = { lat: 53.2734, lng: -7.7783203 },
    zoom = 8,
    minZoom = 7,
    activeLayer = "Terrain",
    markerLayers = [] as MarkerLayer[],
    marker = { id: "", title: "", location: { lat: 53.2734, lng: -7.7783203 } } as MarkerSpec
  } = $props();

  let leafletMapInstance: LeafletMap | null = null;

  // Forward public API methods
  export async function addPopupMarkerAndZoom(layer: string, spec: MarkerSpec) {
    if (mapProvider.value === "leaflet" && leafletMapInstance) {
      return leafletMapInstance.addPopupMarkerAndZoom(layer, spec);
    }
    // MapLibre implementation will be added later
  }

  export function moveTo(location: LatLng, zoom?: number): void {
    if (mapProvider.value === "leaflet" && leafletMapInstance) {
      return leafletMapInstance.moveTo(location, zoom);
    }
    // MapLibre implementation will be added later
  }

  export async function addMarker(lat: number, lng: number, popupText: string) {
    if (mapProvider.value === "leaflet" && leafletMapInstance) {
      return leafletMapInstance.addMarker(lat, lng, popupText);
    }
    // MapLibre implementation will be added later
  }
</script>

{#if mapProvider.value === "leaflet"}
  <LeafletMap
    bind:this={leafletMapInstance}
    {id}
    {height}
    {location}
    {zoom}
    {minZoom}
    {activeLayer}
    {markerLayers}
    {marker}
  />
{:else}
  <div class="text-surface-600-300 flex items-center justify-center bg-surface-200-800" {id} style="height: {height}vh">
    <div class="text-center">
      <p class="text-lg font-semibold">MapLibre</p>
      <p class="text-sm">Map provider: {mapProvider.value}</p>
    </div>
  </div>
{/if}
