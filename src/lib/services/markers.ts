import type { LatLng } from 'leaflet';

export interface MarkerSpec {
  id: string;
  title: string;
  location: LatLng;
}

export interface MarkerLayer {
  title: string;
  markerSpecs: MarkerSpec[];
}
