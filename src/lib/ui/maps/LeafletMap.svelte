<script lang="ts">
  // 1. IMPORTS
  import "leaflet/dist/leaflet.css";
  import { onMount, onDestroy } from "svelte";
  import type { Control, Map as LeafletMap, Marker, LatLng } from "leaflet";
  import type { MarkerLayer, MarkerSpec } from "../../services/markers";
  import {
    type BaseLayers,
    type Overlays,
    POPUP_OPTIONS,
    MARKER_ICON_CONFIG,
    createBaseLayers,
    getOrCreateOverlay,
    createMarker,
    populateLayer
  } from "./LeafletMap.utils";

  // 3. PROPS
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

  // 4. STATE
  let map: LeafletMap | null = null;
  let control: Control.Layers | null = null;
  let baseLayers: BaseLayers = {};
  let overlays: Overlays = {};
  let markerMap = new Map<Marker, MarkerSpec>();

  // 5. INITIALIZATION
  async function initializeMap() {
    const leaflet = await import("leaflet");
    const L = leaflet.default;

    // Configure icons
    // @ts-ignore - _getIconUrl is a runtime property that exists but isn't in types
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions(MARKER_ICON_CONFIG);

    // Create base layers
    baseLayers = createBaseLayers(L);

    // Initialize map
    map = L.map(id, {
      center: [location.lat, location.lng],
      zoom,
      minZoom,
      layers: [baseLayers[activeLayer]]
    });

    // Setup layer control
    control = L.control.layers(baseLayers, overlays).addTo(map);
  }

  // 6. LAYER MANAGEMENT
  // (Functions moved to LeafletMap.utils.ts)

  // 8. PUBLIC API
  export async function addPopupMarkerAndZoom(layer: string, spec: MarkerSpec) {
    if (!map) return;

    const leaflet = await import("leaflet");
    const L = leaflet.default;
    const overlay = getOrCreateOverlay(layer, L, overlays, map, control);
    const popup = L.popup(POPUP_OPTIONS).setLatLng(spec.location).setContent(spec.title);
    popup.addTo(overlay);
    moveTo(spec.location, 15);
  }

  export function moveTo(location: LatLng, zoom?: number): void {
    if (!map) return;
    if (zoom) {
      map.flyTo(location, zoom);
    } else {
      map.flyTo(location);
    }
  }

  export async function addMarker(lat: number, lng: number, popupText: string) {
    if (!map) return;
    const leaflet = await import("leaflet");
    const L = leaflet.default;
    const marker = L.marker([lat, lng]).addTo(map);
    const popup = L.popup(POPUP_OPTIONS);
    popup.setContent(popupText);
    marker.bindPopup(popup);
  }

  // 9. LIFECYCLE
  onMount(async () => {
    try {
      await initializeMap();
      if (marker.id) {
        await addPopupMarkerAndZoom("default", marker);
      }
      if (markerLayers.length > 0) {
        const leaflet = await import("leaflet");
        const L = leaflet.default;
        markerLayers.forEach((layer) => populateLayer(layer, L, overlays, map, control, markerMap));
      }
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div class="z-10" {id} style="height: {height}vh"></div>
