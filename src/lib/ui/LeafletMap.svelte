<script lang="ts">
  // 1. IMPORTS
  import "leaflet/dist/leaflet.css";
  import { onMount, onDestroy } from "svelte";
  import type { Control, LayerGroup, Map as LeafletMap, Marker, TileLayer, LatLng } from "leaflet";
  import type { MarkerLayer, MarkerSpec } from "../services/markers";
  import { markerSelected } from "$lib/runes.svelte";

  // 2. TYPES & CONSTANTS
  type BaseLayers = Record<string, TileLayer>;
  type Overlays = Record<string, LayerGroup>;

  const POPUP_OPTIONS = {
    autoClose: false,
    closeOnClick: false,
    closeButton: false
  } as const;

  const MARKER_ICON_CONFIG = {
    iconRetinaUrl: "/images/marker-icon-2x.png",
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png"
  } as const;

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

  function createBaseLayers(L: any): BaseLayers {
    return {
      Terrain: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      }),
      Satellite: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        }
      )
    };
  }

  // 6. LAYER MANAGEMENT
  function getOrCreateOverlay(title: string, L: any): LayerGroup {
    if (!overlays[title]) {
      overlays[title] = L.layerGroup([]);
      map?.addLayer(overlays[title]);
      control?.addOverlay(overlays[title], title);
    }
    return overlays[title];
  }

  // 7. MARKER MANAGEMENT
  function createMarker(spec: MarkerSpec, L: any): Marker {
    const marker = L.marker([spec.location.lat, spec.location.lng]);
    const popup = L.popup(POPUP_OPTIONS);
    popup.setContent(`<a href='/poi/${spec.id}'>${spec.title} <small>(click for details)</small></a>`);
    marker.bindPopup(popup);
    marker.bindTooltip(spec.title);
    markerMap.set(marker, spec);
    return marker;
  }

  function populateLayer(markerLayer: MarkerLayer, L: any) {
    const group = getOrCreateOverlay(markerLayer.title, L);

    markerLayer.markerSpecs.forEach((spec) => {
      const marker = createMarker(spec, L);
      marker.addTo(group);
      marker.on("popupopen", () => {
        markerSelected.value = spec;
      });
    });
  }

  // 8. PUBLIC API
  export async function addPopupMarkerAndZoom(layer: string, spec: MarkerSpec) {
    if (!map) return;

    const leaflet = await import("leaflet");
    const L = leaflet.default;
    const overlay = getOrCreateOverlay(layer, L);
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
        markerLayers.forEach((layer) => populateLayer(layer, L));
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
