import type { Island, IslandGroup } from "./oileain-types";
import type { MarkerLayer, MarkerSpec } from "./markers";

// Converter functions to generate Leaflet marker compatible collections
// from above data structures
export function generateMarkerSpec(island: Island): MarkerSpec {
  return <MarkerSpec>{
    id: island.safeName,
    title: island.name,
    location: {
      lat: island.coordinates.geo.lat,
      lng: island.coordinates.geo.long
    }
  };
}

export function generateMarkerSpecs(islands: Array<Island>): MarkerSpec[] {
  const markerSpecs = Array<MarkerSpec>();
  islands.forEach((island) => {
    markerSpecs.push(island.markerSpec);
  });
  return markerSpecs;
}

export function generateMarkerLayer(islandGroup: IslandGroup): MarkerLayer {
  return {
    title: islandGroup.title,
    markerSpecs: generateMarkerSpecs(islandGroup.pois)
  };
}

export function generateMarkerLayers(coasts: IslandGroup[]): MarkerLayer[] {
  const markerLayers: Array<MarkerLayer> = [];
  coasts.forEach((coast) => {
    markerLayers.push(coast.markerLayer);
  });
  return markerLayers;
}
