import type { MarkerLayer, MarkerSpec } from "./markers";

// Types for the geographic model as encoded in
//  - https://github.com/edeleastar/oileain-api

// Geodetic Co-ordinates
// WGS84/ETRS89
// Used as reference for GPS and online maps of Ireland
// GPS-compatible
export interface Geodetic {
  lat: number;
  long: number;
}

// Irish Grid
// Used on OS maps of Ireland since the 1960s.
export interface Grid {
  sheet: string;
  eastings: number;
  northings: number;
}

// Irish Grid Full Co-ordinates
export interface FullGrid {
  eastings: number;
  northings: number;
}

// Container for above co-ordinate systems
export interface Coordinates {
  irishGrid: Grid;
  fullIrishGrid: FullGrid;
  tmcGrid: FullGrid; //Irish Transverse Mercator Grid Co-ordinates
  geo: Geodetic;
}

// A single island
export interface Island {
  name: string;
  shortenedName: string;
  safeName: string;
  nameHtml: string;
  costalZone: string;
  coordinates: Coordinates;
  cursor: number;
  description: string;
  coast?: IslandGroup;
  markerSpec: MarkerSpec;
}

// A group of Islands
export interface IslandGroup {
  title: string;
  variable: string;
  identifier: string;
  geo: Geodetic;
  pois: Array<Island>; // islands known as pois (points of interest)
  markerLayer: MarkerLayer;
}
