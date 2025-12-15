import { oileainService } from "$lib/services/oileain-service";
import { generateMarkerSpec } from "$lib/services/oileain-utils";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  await oileainService.getCoasts(fetch);
  const island = await oileainService.getIslandById(encodeURI(params.id));
  const marker = generateMarkerSpec(island);
  return {
    island,
    marker,
    markerLayers: oileainService.markerLayers
  };
};
