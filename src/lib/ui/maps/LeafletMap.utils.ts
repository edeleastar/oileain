import type { LayerGroup, Marker, TileLayer } from "leaflet";
import type { MarkerLayer, MarkerSpec } from "../../services/markers";
import { markerSelected } from "$lib/runes.svelte";

// Types
export type BaseLayers = Record<string, TileLayer>;
export type Overlays = Record<string, LayerGroup>;

// Constants
export const POPUP_OPTIONS = {
  autoClose: false,
  closeOnClick: false,
  closeButton: false
} as const;

export const MARKER_ICON_CONFIG = {
  iconRetinaUrl: "/images/marker-icon-2x.png",
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png"
} as const;

// Helper Functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createBaseLayers(L: any): BaseLayers {
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

export function getOrCreateOverlay(
  title: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  L: any,
  overlays: Overlays,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
): LayerGroup {
  if (!overlays[title]) {
    overlays[title] = L.layerGroup([]);
    map?.addLayer(overlays[title]);
    control?.addOverlay(overlays[title], title);
  }
  return overlays[title];
}

export function createMarker(
  spec: MarkerSpec,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  L: any,
  markerMap: Map<Marker, MarkerSpec>
): Marker {
  const marker = L.marker([spec.location.lat, spec.location.lng]);
  const popup = L.popup(POPUP_OPTIONS);
  popup.setContent(`<a href='/poi/${spec.id}'>${spec.title} <small>(click for details)</small></a>`);
  marker.bindPopup(popup);
  marker.bindTooltip(spec.title);
  markerMap.set(marker, spec);
  return marker;
}

export function populateLayer(
  markerLayer: MarkerLayer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  L: any,
  overlays: Overlays,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any,
  markerMap: Map<Marker, MarkerSpec>
) {
  const group = getOrCreateOverlay(markerLayer.title, L, overlays, map, control);

  markerLayer.markerSpecs.forEach((spec) => {
    const marker = createMarker(spec, L, markerMap);
    marker.addTo(group);
    marker.on("popupopen", () => {
      markerSelected.value = spec;
    });
  });
}
