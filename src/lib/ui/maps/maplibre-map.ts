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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private maplibre: any = null;
  private map: MapLibreMap | null = null;
  private readonly overlays: Overlays = {};
  private readonly markerMap = new Map<Marker, MarkerSpec>();
  private currentStyle: string = "";

  async initializeMap(id: string, location: MapLocation, zoom: number, minZoom: number, activeLayer: string) {
    // Import MapLibre dynamically
    const maplibreModule = await import("maplibre-gl");
    this.maplibre = maplibreModule.default || maplibreModule;

    // Get container element
    const container = document.getElementById(id);
    if (!container) {
      throw new Error(`Map container with id "${id}" not found`);
    }

    // Create base layers/styles
    const baseLayers = this.createBaseLayers();
    const style = baseLayers[activeLayer] || baseLayers.Terrain;

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
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markerMap.clear();
  }

  async addPopupMarkerAndZoom(layer: string, spec: MarkerSpec): Promise<void> {
    if (!this.map) return;

    // Create or get overlay source
    const sourceId = this.getOrCreateOverlay(layer);

    // Add marker
    const marker = this.createMarker(spec);
    marker.addTo(this.map);

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
    }
    return this.overlays[title];
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

    // Wait for map to be ready
    if (!this.map.isStyleLoaded()) {
      this.map.once("style.load", () => {
        this.populateLayer(markerLayer);
      });
      return;
    }

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
    });
  }
}
