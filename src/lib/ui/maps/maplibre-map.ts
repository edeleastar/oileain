import type { Marker, Map as MapLibreMap } from "maplibre-gl";
import type { MarkerLayer, MarkerSpec, MapProvider, MapLocation } from "./map";
import { markerSelected } from "$lib/runes.svelte";
import { MapLibreOverlayManager } from "./maplibre-overlay-manager";
import { MapLibreControlManager } from "./maplibre-control-manager";

export interface BaseLayer {
  [key: string]: unknown;
}

export interface OverlayLayer {
  [key: string]: unknown;
}

export type BaseLayers = Record<string, string | object>; // Style URLs or style objects
export type Overlays = Record<string, string>; // Source IDs

export const MAPLIBRE_CONFIG = {
  STYLE_VERSION: 8,
  TILE_SIZE: 256,
  MAX_ZOOM: 19,
  ZOOM_OFFSET: -2,
  DEFAULT_MARKER_ZOOM: 15
} as const;

export const EMPTY_GEOJSON = {
  type: "FeatureCollection",
  features: []
} as const;

export class MapLibreMapProvider implements MapProvider {
  name = "MapLibre" as const;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private maplibre: any = null;
  private map: MapLibreMap | null = null;
  private readonly markerMap = new Map<Marker, MarkerSpec>();
  private readonly overlayManager = new MapLibreOverlayManager();
  private readonly controlManager = new MapLibreControlManager();
  private activeLayerName = "";
  private baseLayers: BaseLayers = {};

  async initializeMap(id: string, location: MapLocation, zoom: number, minZoom: number, activeLayer: string) {
    // Import MapLibre dynamically
    const maplibreModule = await import("maplibre-gl");
    this.maplibre = maplibreModule.default || maplibreModule;

    // Validate container
    const container = document.getElementById(id);
    if (!container) {
      throw new Error(`Map container with id "${id}" not found`);
    }

    this.baseLayers = this.createBaseLayers();
    await this.createMapInstance(id, location, zoom + MAPLIBRE_CONFIG.ZOOM_OFFSET, minZoom, activeLayer);
    await this.waitForLoad();
    this.setupControls();
  }

  private async createMapInstance(
    id: string,
    location: MapLocation,
    zoom: number,
    minZoom: number,
    activeLayer: string
  ): Promise<void> {
    const style = this.baseLayers[activeLayer] || this.baseLayers.Terrain;
    this.activeLayerName = activeLayer || "Terrain";

    this.map = new this.maplibre.Map({
      container: id,
      style,
      center: [location.lng, location.lat], // MapLibre uses [lng, lat]
      zoom,
      minZoom,
      maxZoom: MAPLIBRE_CONFIG.MAX_ZOOM,
      antialias: true, // Enable antialiasing for smoother rendering
      pitch: 0, // Flat view
      bearing: 0 // North up
    });
  }

  private async waitForLoad(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.map!.on("load", () => {
        resolve();
      });
    });
  }

  private setupControls(): void {
    if (!this.map) return;
    this.overlayManager.initialize(this.map);
    this.controlManager.initialize(this.map);
    this.map.addControl(new this.maplibre.NavigationControl(), "top-right");
    this.createLayerControl();
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markerMap.clear();
    this.overlayManager.clear();
    this.controlManager.destroy();
  }

  async addPopupMarkerAndZoom(layer: string, spec: MarkerSpec): Promise<void> {
    if (!this.map) return;

    this.overlayManager.getOrCreateOverlay(layer);
    const marker = this.createMarker(spec);
    marker.addTo(this.map);
    this.overlayManager.associateMarker(marker, layer);

    this.moveTo(spec.location, MAPLIBRE_CONFIG.DEFAULT_MARKER_ZOOM);
  }

  moveTo(location: MapLocation, zoom?: number): void {
    if (!this.map) return;
    const options: { center: [number, number]; zoom?: number } = {
      center: [location.lng, location.lat] // MapLibre uses [lng, lat]
    };
    if (zoom !== undefined) {
      options.zoom = zoom;
    }
    this.map.flyTo(options);
  }

  async addMarker(lat: number, lng: number, popupText: string): Promise<void> {
    if (!this.map) return;
    const marker = new this.maplibre.Marker().setLngLat([lng, lat]).addTo(this.map);

    const popup = new this.maplibre.Popup().setHTML(popupText);
    marker.setPopup(popup);
  }

  createBaseLayers(): BaseLayers {
    return {
      Terrain: this.createRasterStyle(
        "osm-tiles",
        ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      ),
      Satellite: this.createRasterStyle(
        "esri-satellite",
        ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      )
    };
  }

  private createRasterStyle(sourceId: string, tiles: string[], attribution: string): object {
    return {
      version: MAPLIBRE_CONFIG.STYLE_VERSION,
      sources: {
        [sourceId]: {
          type: "raster",
          tiles,
          tileSize: MAPLIBRE_CONFIG.TILE_SIZE,
          attribution
        }
      },
      layers: [
        {
          id: sourceId,
          type: "raster",
          source: sourceId,
          minzoom: 0,
          maxzoom: MAPLIBRE_CONFIG.MAX_ZOOM
        }
      ]
    };
  }

  private createLayerControl(): void {
    if (!this.map) return;

    const overlaySection = this.createOverlaySection();
    const control = this.controlManager.buildControl(
      this.baseLayers,
      this.activeLayerName,
      (layerName) => this.switchBaseLayer(layerName),
      overlaySection
    );
    this.attachControl(control);
  }

  private createOverlaySection(): HTMLElement {
    const overlaysDiv = document.createElement("div");
    overlaysDiv.id = "maplibre-overlays";
    const overlaysLabel = document.createElement("div");
    overlaysLabel.textContent = "Overlays";
    overlaysLabel.style.fontWeight = "bold";
    overlaysLabel.style.marginBottom = "5px";
    overlaysDiv.appendChild(overlaysLabel);
    this.overlayManager.setOverlaySection(overlaysDiv);
    return overlaysDiv;
  }

  private attachControl(control: HTMLElement): void {
    this.controlManager.attach(control);
  }

  private switchBaseLayer(layerName: string): void {
    if (!this.map || !this.baseLayers[layerName]) return;
    this.activeLayerName = layerName;
    const style = this.baseLayers[layerName];
    // MapLibre accepts either a style URL (string) or a style specification object; our type reflects that.
    this.map.setStyle(style as unknown as string);
  }

  createMarker(spec: MarkerSpec): Marker {
    const popup = new this.maplibre.Popup({ closeOnClick: false, closeButton: false }).setHTML(
      `<a href='/poi/${spec.id}'>${spec.title} <small>(click for details)</small></a>`
    );

    const marker = new this.maplibre.Marker().setLngLat([spec.location.lng, spec.location.lat]).setPopup(popup);

    // Add tooltip/title
    marker.getElement().title = spec.title;

    // Store marker mapping
    this.markerMap.set(marker, spec);

    // Handle popup open event
    popup.on("open", () => {
      markerSelected.value = spec;
    });

    return marker;
  }

  populateLayer(markerLayer: MarkerLayer): void {
    if (!this.map) return;

    this.overlayManager.getOrCreateOverlay(markerLayer.title);

    markerLayer.markerSpecs.forEach((spec) => {
      const marker = this.createMarker(spec);
      marker.addTo(this.map!);
      this.overlayManager.associateMarker(marker, markerLayer.title);
    });
  }
}
