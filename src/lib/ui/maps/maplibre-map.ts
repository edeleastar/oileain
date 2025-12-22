import type { Marker, Popup, Map as MapLibreMap } from "maplibre-gl";
import type { MarkerLayer, MarkerSpec, MapProvider, MapLocation } from "./map";
import { markerSelected } from "$lib/runes.svelte";

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
  private readonly overlays: Overlays = {};
  private readonly markerMap = new Map<Marker, MarkerSpec>();
  private readonly markerOverlayMap = new Map<Marker, string>(); // Track which overlay each marker belongs to
  private activeLayerName = "";
  private baseLayers: BaseLayers = {};
  private overlayVisibility: Record<string, boolean> = {};
  private layerControlContainer: HTMLElement | null = null;

  async initializeMap(id: string, location: MapLocation, zoom: number, minZoom: number, activeLayer: string) {
    await this.loadLibrary();
    this.validateContainer(id);
    this.baseLayers = this.createBaseLayers();
    await this.createMapInstance(id, location, zoom + MAPLIBRE_CONFIG.ZOOM_OFFSET, minZoom, activeLayer);
    await this.waitForLoad();
    this.setupControls();
  }

  private async loadLibrary(): Promise<void> {
    const maplibreModule = await import("maplibre-gl");
    this.maplibre = maplibreModule.default || maplibreModule;
  }

  private validateContainer(id: string): void {
    const container = document.getElementById(id);
    if (!container) {
      throw new Error(`Map container with id "${id}" not found`);
    }
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
    this.map.addControl(new this.maplibre.NavigationControl(), "top-right");
    this.createLayerControl();
  }

  destroy(): void {
    if (this.layerControlContainer) {
      this.layerControlContainer.remove();
      this.layerControlContainer = null;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markerMap.clear();
    this.overlayVisibility = {};
  }

  async addPopupMarkerAndZoom(layer: string, spec: MarkerSpec): Promise<void> {
    if (!this.map) return;

    // Create or get overlay source
    const sourceId = this.getOrCreateOverlay(layer);

    // Add marker
    const marker = this.createMarker(spec);
    marker.addTo(this.map);
    this.markerOverlayMap.set(marker, layer);

    // Create and show popup
    const popup = new this.maplibre.Popup({ closeOnClick: false, closeButton: false })
      .setLngLat([spec.location.lng, spec.location.lat])
      .setHTML(`<a href='/poi/${spec.id}'>${spec.title} <small>(click for details)</small></a>`)
      .addTo(this.map);

    // Fly to location
    this.moveTo(spec.location, 15);
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

  getOrCreateOverlay(title: string): string {
    if (!this.overlays[title]) {
      const sourceId = `overlay-${title.toLowerCase().replace(/\s+/g, "-")}`;
      this.overlays[title] = sourceId;
      this.overlayVisibility[title] = true;

      if (this.map) {
        this.ensureSourceExists(sourceId);
      }

      this.addOverlayToControl(title);
    }
    return this.overlays[title];
  }

  private ensureSourceExists(sourceId: string): void {
    if (!this.map) return;

    const addSource = () => {
      if (!this.map!.getSource(sourceId)) {
        this.map!.addSource(sourceId, {
          type: "geojson",
          data: EMPTY_GEOJSON
        });
      }
    };

    if (this.map.isStyleLoaded()) {
      addSource();
    } else {
      this.map.once("style.load", addSource);
    }
  }

  private createLayerControl(): void {
    if (!this.map) return;

    const control = this.createControlContainer();
    control.appendChild(this.createBaseLayerSection());
    control.appendChild(this.createOverlaySection());
    this.attachControl(control);
  }

  private createControlContainer(): HTMLElement {
    const control = document.createElement("div");
    control.className = "maplibregl-ctrl maplibregl-ctrl-group";
    control.style.cssText = `
      background: white;
      border-radius: 4px;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
      padding: 10px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      max-width: 200px;
    `;
    return control;
  }

  private createBaseLayerSection(): HTMLElement {
    const baseLayersDiv = document.createElement("div");
    baseLayersDiv.style.marginBottom = "10px";

    const baseLayersLabel = this.createSectionLabel("Base Layers");
    baseLayersDiv.appendChild(baseLayersLabel);

    Object.keys(this.baseLayers).forEach((layerName) => {
      baseLayersDiv.appendChild(this.createBaseLayerRadio(layerName));
    });

    return baseLayersDiv;
  }

  private createSectionLabel(text: string): HTMLElement {
    const label = document.createElement("div");
    label.textContent = text;
    label.style.fontWeight = "bold";
    label.style.marginBottom = "5px";
    return label;
  }

  private createBaseLayerRadio(layerName: string): HTMLElement {
    const label = document.createElement("label");
    label.style.cssText = "display: block; margin: 3px 0; cursor: pointer;";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "baseLayer";
    input.value = layerName;
    input.checked = this.activeLayerName === layerName;

    input.addEventListener("change", () => {
      if (input.checked) {
        this.switchBaseLayer(layerName);
      }
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${layerName}`));
    return label;
  }

  private createOverlaySection(): HTMLElement {
    const overlaysDiv = document.createElement("div");
    overlaysDiv.id = "maplibre-overlays";
    const overlaysLabel = this.createSectionLabel("Overlays");
    overlaysDiv.appendChild(overlaysLabel);
    return overlaysDiv;
  }

  private attachControl(control: HTMLElement): void {
    if (!this.map) return;

    const mapContainer = this.map.getContainer();
    const controlContainer = document.createElement("div");
    controlContainer.className = "maplibregl-ctrl-top-left";
    controlContainer.style.cssText = "position: absolute; top: 10px; left: 10px; z-index: 1000;";
    controlContainer.appendChild(control);
    mapContainer.appendChild(controlContainer);

    this.layerControlContainer = controlContainer;
  }

  private switchBaseLayer(layerName: string): void {
    if (!this.map || !this.baseLayers[layerName]) return;

    this.activeLayerName = layerName;
    const preservedMarkers = this.preserveMarkers();
    this.map.setStyle(this.baseLayers[layerName]);

    this.map.once("style.load", () => {
      this.restoreMarkers(preservedMarkers);
      this.restoreOverlaySources();
    });
  }

  private preserveMarkers(): Array<{ marker: Marker; spec: MarkerSpec; overlay: string | undefined }> {
    const markers: Array<{ marker: Marker; spec: MarkerSpec; overlay: string | undefined }> = [];
    this.markerMap.forEach((spec, marker) => {
      markers.push({
        marker,
        spec,
        overlay: this.markerOverlayMap.get(marker)
      });
    });
    return markers;
  }

  private restoreMarkers(
    preservedMarkers: Array<{ marker: Marker; spec: MarkerSpec; overlay: string | undefined }>
  ): void {
    preservedMarkers.forEach(({ marker, spec, overlay }) => {
      const newMarker = this.createMarker(spec);
      newMarker.addTo(this.map!);
      this.markerMap.delete(marker);
      this.markerMap.set(newMarker, spec);

      if (overlay) {
        this.markerOverlayMap.delete(marker);
        this.markerOverlayMap.set(newMarker, overlay);
        this.restoreMarkerVisibility(newMarker, overlay);
      }
    });
  }

  private restoreMarkerVisibility(marker: Marker, overlayTitle: string): void {
    const isVisible = this.overlayVisibility[overlayTitle] !== false;
    const markerEl = marker.getElement();
    if (markerEl) {
      markerEl.style.display = isVisible ? "block" : "none";
    }
  }

  private restoreOverlaySources(): void {
    if (!this.map) return;

    Object.keys(this.overlays).forEach((title) => {
      const sourceId = this.overlays[title];
      this.ensureSourceExists(sourceId);
    });
  }

  private addOverlayToControl(title: string): void {
    if (!this.layerControlContainer) return;

    const overlaysDiv = this.layerControlContainer.querySelector("#maplibre-overlays");
    if (!overlaysDiv) return;

    const label = document.createElement("label");
    label.style.cssText = "display: block; margin: 3px 0; cursor: pointer;";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = this.overlayVisibility[title] !== false;
    input.addEventListener("change", () => {
      this.toggleOverlay(title, input.checked);
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${title}`));
    overlaysDiv.appendChild(label);
  }

  private toggleOverlay(title: string, visible: boolean): void {
    if (!this.map) return;

    this.overlayVisibility[title] = visible;

    // Toggle visibility of all markers in this overlay
    this.markerOverlayMap.forEach((overlayTitle, marker) => {
      if (overlayTitle === title) {
        const markerEl = marker.getElement();
        if (markerEl) {
          markerEl.style.display = visible ? "block" : "none";
        }
      }
    });
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

    // Get or create overlay source
    const sourceId = this.getOrCreateOverlay(markerLayer.title);

    // Ensure source exists
    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });
    }

    // Add markers to the layer
    markerLayer.markerSpecs.forEach((spec) => {
      const marker = this.createMarker(spec);
      marker.addTo(this.map!);
      this.markerOverlayMap.set(marker, markerLayer.title);
    });
  }
}
