export interface MapLocation {
  lat: number;
  lng: number;
}

export interface MarkerSpec {
  id: string;
  title: string;
  location: MapLocation;
}

export interface MarkerLayer {
  title: string;
  markerSpecs: MarkerSpec[];
}

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

export interface MapProvider {
  name: string;
  initializeMap(id: string, location: MapLocation, zoom: number, minZoom: number, activeLayer: string): void;
  destroy(): void;
  addPopupMarkerAndZoom(layer: string, spec: MarkerSpec): Promise<void>;
  moveTo(location: MapLocation, zoom?: number): void;
  addMarker(lat: number, lng: number, popupText: string): Promise<void>;
  populateLayer(markerLayer: MarkerLayer): void;
}
