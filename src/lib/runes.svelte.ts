import type { MarkerSpec } from "$lib/services/markers";
import type { Island } from "$lib/services/oileain-types";

export const markerSelected = $state({ value: null as MarkerSpec | null });
export const currentIsland = $state({ value: null as Island | null });
export const currentView = $state({ value: "Home: " });
