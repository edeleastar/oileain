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

export class MapLibreMapProvider implements MapProvider {
  name = "MapLibre" as const;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private maplibre: any = null;
  private map: MapLibreMap | null = null;
  private readonly overlays: Overlays = {};
  private readonly markerMap = new Map<Marker, MarkerSpec>();
  private readonly markerOverlayMap = new Map<Marker, string>(); // Track which overlay each marker belongs to
  private currentStyle: string = "";
  private baseLayers: BaseLayers = {};
  private overlayVisibility: Record<string, boolean> = {};
  private layerControlContainer: HTMLElement | null = null;

  async initializeMap(id: string, location: MapLocation, zoom: number, minZoom: number, activeLayer: string) {
    zoom = zoom - 2;
    // Import MapLibre dynamically
    const maplibreModule = await import("maplibre-gl");
    this.maplibre = maplibreModule.default || maplibreModule;

    // Get container element
    const container = document.getElementById(id);
    if (!container) {
      throw new Error(`Map container with id "${id}" not found`);
    }

    // Create base layers/styles
    this.baseLayers = this.createBaseLayers();
    const style = this.baseLayers[activeLayer] || this.baseLayers.Terrain;

    // Initialize map with enhanced settings for better detail
    this.map = new this.maplibre.Map({
      container: id,
      style: style,
      center: [location.lng, location.lat], // MapLibre uses [lng, lat]
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: 19, // Allow higher zoom for more detail (OSM supports up to 19)
      antialias: true, // Enable antialiasing for smoother rendering
      pitch: 0, // Flat view
      bearing: 0 // North up
    });

    this.currentStyle = typeof style === "string" ? style : JSON.stringify(style);

    // Wait for map to load
    await new Promise<void>((resolve) => {
      this.map!.on("load", () => {
        // Ensure all layers are visible and detailed
        // This helps show more map features
        resolve();
      });
    });

    // Add navigation controls for better user experience
    this.map.addControl(new this.maplibre.NavigationControl(), "top-right");

    // Add layer control
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
    // Using OpenStreetMap tiles directly with a custom style for maximum detail
    // Terrain style - Custom style using OSM tiles with detailed features
    const terrainStyle = this.createOSMStyle();

    // Satellite style - Using Esri World Imagery tiles (free, no API key needed)
    const satelliteStyle = this.createSatelliteStyle();

    return {
      Terrain: terrainStyle,
      Satellite: satelliteStyle
    };
  }

  private createOSMStyle(): object {
    // Create a style object that uses OpenStreetMap tiles directly
    // This provides detailed maps with roads, labels, and features
    return {
      version: 8,
      sources: {
        "osm-tiles": {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      layers: [
        {
          id: "osm-tiles",
          type: "raster",
          source: "osm-tiles",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };
  }

  private createSatelliteStyle(): object {
    // Create a style using Esri World Imagery (satellite) tiles
    return {
      version: 8,
      sources: {
        "esri-satellite": {
          type: "raster",
          tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
          tileSize: 256,
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        }
      },
      layers: [
        {
          id: "esri-satellite",
          type: "raster",
          source: "esri-satellite",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };
  }

  getOrCreateOverlay(title: string): string {
    if (!this.overlays[title]) {
      // Create a unique source ID for this overlay
      const sourceId = `overlay-${title.toLowerCase().replace(/\s+/g, "-")}`;
      this.overlays[title] = sourceId;
      this.overlayVisibility[title] = true; // Default to visible

      // Add source and layer to map if map is loaded
      if (this.map) {
        const addSource = () => {
          if (!this.map!.getSource(sourceId)) {
            this.map!.addSource(sourceId, {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: []
              }
            });
          }
        };

        if (this.map.isStyleLoaded()) {
          addSource();
        } else {
          this.map.once("style.load", addSource);
        }
      }

      // Add overlay to layer control
      this.addOverlayToControl(title);
    }
    return this.overlays[title];
  }

  private createLayerControl(): void {
    if (!this.map) return;

    // Create layer control container
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

    // Base layers section
    const baseLayersDiv = document.createElement("div");
    baseLayersDiv.style.marginBottom = "10px";
    const baseLayersLabel = document.createElement("div");
    baseLayersLabel.textContent = "Base Layers";
    baseLayersLabel.style.fontWeight = "bold";
    baseLayersLabel.style.marginBottom = "5px";
    baseLayersDiv.appendChild(baseLayersLabel);

    // Add base layer radio buttons
    Object.keys(this.baseLayers).forEach((layerName) => {
      const label = document.createElement("label");
      label.style.cssText = "display: block; margin: 3px 0; cursor: pointer;";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "baseLayer";
      input.value = layerName;
      input.checked =
        this.currentStyle ===
        (typeof this.baseLayers[layerName] === "string"
          ? this.baseLayers[layerName]
          : JSON.stringify(this.baseLayers[layerName]));

      input.addEventListener("change", () => {
        if (input.checked) {
          this.switchBaseLayer(layerName);
        }
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${layerName}`));
      baseLayersDiv.appendChild(label);
    });

    control.appendChild(baseLayersDiv);

    // Overlays section
    const overlaysDiv = document.createElement("div");
    overlaysDiv.id = "maplibre-overlays";
    const overlaysLabel = document.createElement("div");
    overlaysLabel.textContent = "Overlays";
    overlaysLabel.style.fontWeight = "bold";
    overlaysLabel.style.marginBottom = "5px";
    overlaysDiv.appendChild(overlaysLabel);
    control.appendChild(overlaysDiv);

    // Add control to map
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

    const style = this.baseLayers[layerName];
    this.currentStyle = typeof style === "string" ? style : JSON.stringify(style);

    // Store current markers before style change
    const markers: Array<{ marker: Marker; spec: MarkerSpec }> = [];
    this.markerMap.forEach((spec, marker) => {
      markers.push({ marker, spec });
    });

    // Switch style
    this.map.setStyle(style);

    // Wait for style to load, then re-add markers
    this.map.once("style.load", () => {
      // Re-add all markers with their overlay associations
      markers.forEach(({ marker, spec }) => {
        const overlayTitle = this.markerOverlayMap.get(marker);
        const newMarker = this.createMarker(spec);
        newMarker.addTo(this.map!);
        this.markerMap.delete(marker);
        this.markerMap.set(newMarker, spec);
        if (overlayTitle) {
          this.markerOverlayMap.delete(marker);
          this.markerOverlayMap.set(newMarker, overlayTitle);
          // Restore visibility based on overlay visibility state
          const isVisible = this.overlayVisibility[overlayTitle] !== false;
          const markerEl = newMarker.getElement();
          if (markerEl) {
            markerEl.style.display = isVisible ? "block" : "none";
          }
        }
      });

      // Re-add overlay sources
      Object.keys(this.overlays).forEach((title) => {
        const sourceId = this.overlays[title];
        if (!this.map!.getSource(sourceId)) {
          this.map!.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: []
            }
          });
        }
      });
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
