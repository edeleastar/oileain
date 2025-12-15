import { oileainService } from "$lib/services/oileain-service";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  await oileainService.getCoasts(fetch);
  return {
    markerLayers: oileainService.markerLayers
  };
};
