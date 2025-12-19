// Map Location Type (provider-agnostic)
export interface MapLocation {
  lat: number;
  lng: number;
}

// Abstract Marker Types (provider-agnostic)
export interface MarkerSpec {
  id: string;
  title: string;
  location: MapLocation;
}

export interface MarkerLayer {
  title: string;
  markerSpecs: MarkerSpec[];
}

// Map Component Props Interface
export interface MapProps {
  id?: string;
  height?: number;
  location?: MapLocation;
  zoom?: number;
  minZoom?: number;
  activeLayer?: string;
  markerLayers?: MarkerLayer[];
  marker?: MarkerSpec;
}

// Abstract Map Types (provider-agnostic)
export interface BaseLayer {
  // Base layer interface - implementation specific
  [key: string]: unknown;
}

export interface OverlayLayer {
  // Overlay layer interface - implementation specific
  [key: string]: unknown;
}

export interface MapMarker {
  // Map marker interface - implementation specific
  [key: string]: unknown;
}

export type BaseLayers = Record<string, BaseLayer>;
export type Overlays = Record<string, OverlayLayer>;

// Map Provider Interface (provider-agnostic)
// Merges both component public API and utility functions
export interface MapProvider {
  // Initialization
  initializeMap(
    id: string,
    location: MapLocation,
    zoom: number,
    minZoom: number,
    activeLayer: string
  ): Promise<BaseLayers>;
  destroy(): void;

  // Public API methods (component interface)
  addPopupMarkerAndZoom(layer: string, spec: MarkerSpec): Promise<void>;
  moveTo(location: MapLocation, zoom?: number): void;
  addMarker(lat: number, lng: number, popupText: string): Promise<void>;

  // Utility functions (implementation helpers)
  createBaseLayers(): BaseLayers;
  getOrCreateOverlay(title: string, overlays: Overlays): OverlayLayer;
  createMarker(spec: MarkerSpec, markerMap: Map<MapMarker, MarkerSpec>): MapMarker;
  populateLayer(markerLayer: MarkerLayer, overlays: Overlays, markerMap: Map<MapMarker, MarkerSpec>): void;
}
