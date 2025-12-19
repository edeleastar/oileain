<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { mapProvider } from "$lib/runes.svelte";
  import { LeafletMapProvider } from "./leaflet-map";
  import { MapLibreMapProvider } from "./maplibre-map";
  import type { MarkerLayer, MarkerSpec, MapLocation, MapProvider } from "./map";

  // Import CSS - both will be loaded but only one will be used based on provider
  import "leaflet/dist/leaflet.css";
  import "maplibre-gl/dist/maplibre-gl.css";

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

  let provider = $state<MapProvider | null>(null);
  let isMounted = $state(false);
  let previousProviderValue = $state<string | null>(null);

  // Create provider based on mapProvider rune value
  function createProvider(): MapProvider | null {
    return mapProvider.value === "leaflet"
      ? new LeafletMapProvider()
      : mapProvider.value === "maplibre"
        ? new MapLibreMapProvider()
        : null;
  }

  async function initializeMap() {
    if (!provider) return;

    await provider.initializeMap(id, location as MapLocation, zoom, minZoom, activeLayer);

    // Add markers after initialization
    if (marker.id) {
      await addPopupMarkerAndZoom("default", marker);
    }
    if (markerLayers.length > 0) {
      markerLayers.forEach((layer) => {
        provider!.populateLayer(layer);
      });
    }
  }

  // React to mapProvider changes and reload the map
  $effect(() => {
    if (!isMounted) return; // Wait for component to mount

    const currentProviderValue = mapProvider.value;

    // Only reload if the provider value actually changed
    if (previousProviderValue === currentProviderValue) return;

    // Destroy existing provider if it exists
    if (provider) {
      provider.destroy();
      provider = null;
    }

    // Create new provider
    provider = createProvider();

    // Update tracking
    previousProviderValue = currentProviderValue;

    // Initialize the new provider
    if (provider) {
      initializeMap();
    }
  });

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
    isMounted = true;
    previousProviderValue = mapProvider.value;
    // Create initial provider
    provider = createProvider();
    // Initialize the map
    if (provider) {
      try {
        await initializeMap();
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    }
  });

  onDestroy(() => {
    if (provider) {
      provider.destroy();
    }
  });
</script>

{#if provider}
  <div class="z-10" {id} style="height: {height}vh"></div>
{:else}
  <div class="text-surface-600-300 flex items-center justify-center bg-surface-200-800" {id} style="height: {height}vh">
    <div class="text-center">
      <p class="text-lg font-semibold">Map Provider</p>
      <p class="text-sm">Provider: {mapProvider.value}</p>
    </div>
  </div>
{/if}
