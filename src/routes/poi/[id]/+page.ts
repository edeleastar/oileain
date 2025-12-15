import { oileainService } from "$lib/services/oileain-service";
import { generateMarkerSpec } from "$lib/services/oileain-utils";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const island = await oileainService.getIslandById(encodeURI(params.id), fetch);
  const marker = generateMarkerSpec(island);
  return {
    island,
    marker
  };
};
