import type { LayerGroup, Marker, TileLayer, Map as LeafletMap, Control, LatLng } from "leaflet";
import type { MarkerLayer, MarkerSpec, MapProvider, MapLocation } from "./map";
import { markerSelected } from "$lib/runes.svelte";

export interface BaseLayer {
  [key: string]: unknown;
}

export interface OverlayLayer {
  [key: string]: unknown;
}

export interface MapMarker {
  [key: string]: unknown;
}

export type BaseLayers = Record<string, BaseLayer>;
export type Overlays = Record<string, OverlayLayer>;

export type LeafletBaseLayers = Record<string, TileLayer>;
export type LeafletOverlays = Record<string, LayerGroup>;

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

export class LeafletMapProvider implements MapProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private L: any = null;
  private map: LeafletMap | null = null;
  private control: Control.Layers | null = null;
  private readonly overlays: LeafletOverlays = {};
  private readonly markerMap = new Map<Marker, MarkerSpec>();

  async initializeMap(id: string, location: MapLocation, zoom: number, minZoom: number, activeLayer: string) {
    const leaflet = await import("leaflet");
    this.L = leaflet.default;

    delete this.L.Icon.Default.prototype._getIconUrl;
    this.L.Icon.Default.mergeOptions(MARKER_ICON_CONFIG);

    // Initialize map
    this.map = this.L.map(id, {
      center: [location.lat, location.lng],
      zoom,
      minZoom
    });

    this.control = this.L.control.layers({}, {}).addTo(this.map);
    const baseLayers = this.createBaseLayers();
    this.map!.addLayer(baseLayers[activeLayer] as unknown as TileLayer);
    this.control!.addBaseLayer(baseLayers.Terrain as unknown as TileLayer, "Terrain");
    this.control!.addBaseLayer(baseLayers.Satellite as unknown as TileLayer, "Satellite");
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.control = null;
  }

  async addPopupMarkerAndZoom(layer: string, spec: MarkerSpec): Promise<void> {
    if (!this.map || !this.control) return;
    const overlay = this.getOrCreateOverlay(layer) as unknown as LayerGroup;
    const popup = this.L.popup(POPUP_OPTIONS).setLatLng([spec.location.lat, spec.location.lng]).setContent(spec.title);
    popup.addTo(overlay);
    this.moveTo(spec.location, 15);
  }

  moveTo(location: MapLocation, zoom?: number): void {
    if (!this.map) return;
    const latLng: LatLng = [location.lat, location.lng] as unknown as LatLng;
    if (zoom) {
      this.map.flyTo(latLng, zoom);
    } else {
      this.map.flyTo(latLng);
    }
  }

  async addMarker(lat: number, lng: number, popupText: string): Promise<void> {
    if (!this.map) return;
    const marker = this.L.marker([lat, lng]).addTo(this.map);
    const popup = this.L.popup(POPUP_OPTIONS);
    popup.setContent(popupText);
    marker.bindPopup(popup);
  }

  createBaseLayers(): BaseLayers {
    return {
      Terrain: this.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      }),
      Satellite: this.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        }
      )
    } as BaseLayers;
  }

  getOrCreateOverlay(title: string): OverlayLayer {
    // Use internal overlays instead of parameter
    if (!this.overlays[title]) {
      this.overlays[title] = this.L.layerGroup([]) as LayerGroup;
      this.map!.addLayer(this.overlays[title]);
      this.control!.addOverlay(this.overlays[title], title);
    }
    return this.overlays[title] as unknown as OverlayLayer;
  }

  createMarker(spec: MarkerSpec): MapMarker {
    const marker = this.L.marker([spec.location.lat, spec.location.lng]);
    const popup = this.L.popup(POPUP_OPTIONS);
    popup.setContent(`<a href='/poi/${spec.id}'>${spec.title} <small>(click for details)</small></a>`);
    marker.bindPopup(popup);
    marker.bindTooltip(spec.title);
    this.markerMap.set(marker, spec);
    return marker as MapMarker;
  }

  populateLayer(markerLayer: MarkerLayer): void {
    const group = this.getOrCreateOverlay(markerLayer.title) as unknown as LayerGroup;
    markerLayer.markerSpecs.forEach((spec) => {
      const marker = this.createMarker(spec);
      marker.addTo(group);
      marker.on("popupopen", () => {
        markerSelected.value = spec;
      });
    });
  }
}
