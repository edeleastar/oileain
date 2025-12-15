import type { Island, IslandGroup } from "./oileain-types";
import type { MarkerLayer } from "./markers";
import { generateMarkerLayer, generateMarkerLayers, generateMarkerSpec } from "./oileain-utils";

// Cache & index island data
export const oileainService = {
  // all island data as retrieved from API
  coasts: new Array<IslandGroup>(),
  markerLayers: new Array<MarkerLayer>(),
  // indexes for fast lookup
  islandMap: new Map<string, Island>(),
  coastMap: new Map<string, IslandGroup>(),

  // Retrieve shallow version of all islands (without descriptions and other details)
  async getCoasts(fetchFn: typeof fetch = fetch) {
    if (this.coasts.length == 0) {
      const response = await fetchFn("https://edeleastar.github.io/oileain-model-2/api/oileain-all-slim.json");
      this.coasts = await response.json();
      this.createIndexes();
      this.markerLayers = generateMarkerLayers(this.coasts);
    }
    return this.coasts;
  },

  // Retrieve details in a single island - and cache locally
  async getIslandById(id: string, fetchFn: typeof fetch = fetch): Promise<Island> {
    await this.getCoasts(fetchFn);
    // get local copy
    const cachedPoi = this.islandMap.get(id);
    // see if this is full version
    if (cachedPoi?.description) {
      // it is, return
      return cachedPoi;
    } else if (cachedPoi?.coast) {
      // only shallow version locally - fetch and cache full version.
      const path = `https://edeleastar.github.io/oileain-model-2/api/${cachedPoi.coast.variable}/${id}.json`;
      const response = await fetchFn(path);
      const island = await response.json();
      island.safeName = id;
      island.name = island.nameHtml;
      island.markerSpec = generateMarkerSpec(island);
      this.islandMap.set(id, island);
      return island;
    } else {
      throw new Error(`Island with id ${id} not found`);
    }
  },

  // index all islands by id (safeName)
  createIndexes() {
    this.coasts.forEach((coast) => {
      this.coastMap.set(coast.variable, coast);
      coast.pois.forEach((poi) => {
        poi.coast = coast;
        poi.safeName = encodeURI(poi.safeName);
        poi.markerSpec = generateMarkerSpec(poi);
        this.islandMap.set(poi.safeName, poi);
      });
      coast.markerLayer = generateMarkerLayer(coast);
    });
  }
};
