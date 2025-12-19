<script lang="ts">
  import "leaflet/dist/leaflet.css";
  import { onMount, onDestroy } from "svelte";
  import { mapProvider } from "$lib/runes.svelte";
  import { LeafletMapProvider } from "./leaflet-map";
  import type { MarkerLayer, MarkerSpec, MapLocation, MapProvider } from "./map";

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

  const provider = $state<MapProvider | null>(mapProvider.value === "leaflet" ? new LeafletMapProvider() : null);

  async function initializeMap() {
    if (!provider) return;

    await provider.initializeMap(id, location as MapLocation, zoom, minZoom, activeLayer);
  }

  export async function addPopupMarkerAndZoom(layer: string, spec: MarkerSpec) {
    if (!provider) return;
    await provider.addPopupMarkerAndZoom(layer, spec);
  }

  export function moveTo(location: MapLocation, zoom?: number): void {
    if (!provider) return;
    provider.moveTo(location, zoom);
  }

  export async function addMarker(lat: number, lng: number, popupText: string) {
    if (!provider) return;
    await provider.addMarker(lat, lng, popupText);
  }

  onMount(async () => {
    try {
      await initializeMap();
      if (!provider) return;

      if (marker.id) {
        await addPopupMarkerAndZoom("default", marker);
      }
      if (markerLayers.length > 0) {
        markerLayers.forEach((layer) => {
          provider!.populateLayer(layer);
        });
      }
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
  });

  onDestroy(() => {
    if (provider) {
      provider.destroy();
    }
  });
</script>

{#if mapProvider.value === "leaflet" && provider}
  <div class="z-10" {id} style="height: {height}vh"></div>
{:else}
  <div class="text-surface-600-300 flex items-center justify-center bg-surface-200-800" {id} style="height: {height}vh">
    <div class="text-center">
      <p class="text-lg font-semibold">MapLibre</p>
      <p class="text-sm">Map provider: {mapProvider.value}</p>
    </div>
  </div>
{/if}
