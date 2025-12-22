import type { Marker, Map as MapLibreMap, GeoJSONSourceSpecification } from "maplibre-gl";
import { EMPTY_GEOJSON } from "./maplibre-map";

export class MapLibreOverlayManager {
  private readonly overlays: Record<string, string> = {}; // title -> sourceId
  private readonly overlayVisibility: Record<string, boolean> = {};
  private readonly markerOverlayMap = new Map<Marker, string>();
  private map: MapLibreMap | null = null;
  private overlaySection: HTMLElement | null = null;

  initialize(map: MapLibreMap): void {
    this.map = map;
  }

  setOverlaySection(section: HTMLElement): void {
    this.overlaySection = section;
  }

  getOrCreateOverlay(title: string): string {
    if (!this.overlays[title]) {
      const sourceId = this.generateSourceId(title);
      this.overlays[title] = sourceId;
      this.overlayVisibility[title] = true;

      if (this.map) {
        this.ensureSourceExists(sourceId);
      }

      if (this.overlaySection) {
        this.addToControl(this.overlaySection, title);
      }
    }
    return this.overlays[title];
  }

  associateMarker(marker: Marker, overlayTitle: string): void {
    this.markerOverlayMap.set(marker, overlayTitle);
  }

  disassociateMarker(marker: Marker): void {
    this.markerOverlayMap.delete(marker);
  }

  getOverlayForMarker(marker: Marker): string | undefined {
    return this.markerOverlayMap.get(marker);
  }

  toggleOverlay(title: string, visible: boolean): void {
    if (!this.map) return;

    this.overlayVisibility[title] = visible;

    // Toggle visibility of all markers in this overlay
    this.markerOverlayMap.forEach((overlayTitle, marker) => {
      if (overlayTitle === title) {
        const markerEl = marker.getElement();
        if (markerEl) {
          markerEl.style.display = visible ? "block" : "none";
        }
      }
    });
  }

  isOverlayVisible(title: string): boolean {
    return this.overlayVisibility[title] !== false;
  }

  restoreSources(): void {
    if (!this.map) return;

    Object.keys(this.overlays).forEach((title) => {
      const sourceId = this.overlays[title];
      this.ensureSourceExists(sourceId);
    });
  }

  restoreMarkerVisibility(marker: Marker, overlayTitle: string): void {
    const isVisible = this.isOverlayVisible(overlayTitle);
    const markerEl = marker.getElement();
    if (markerEl) {
      markerEl.style.display = isVisible ? "block" : "none";
    }
  }

  addToControl(overlaySection: HTMLElement, title: string): void {
    if (!overlaySection) return;

    const label = document.createElement("label");
    label.style.cssText = "display: block; margin: 3px 0; cursor: pointer;";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = this.isOverlayVisible(title);
    input.addEventListener("change", () => {
      this.toggleOverlay(title, input.checked);
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${title}`));
    overlaySection.appendChild(label);
  }

  clear(): void {
    this.markerOverlayMap.clear();
    Object.keys(this.overlays).forEach((title) => {
      delete this.overlayVisibility[title];
    });
    Object.keys(this.overlays).forEach((title) => {
      delete this.overlays[title];
    });
  }

  getAllOverlays(): Record<string, string> {
    return { ...this.overlays };
  }

  private generateSourceId(title: string): string {
    return `overlay-${title.toLowerCase().replace(/\s+/g, "-")}`;
  }

  private ensureSourceExists(sourceId: string): void {
    if (!this.map) return;

    const addSource = () => {
      if (!this.map!.getSource(sourceId)) {
        this.map!.addSource(sourceId, {
          type: "geojson",
          data: {
            type: EMPTY_GEOJSON.type,
            features: [...EMPTY_GEOJSON.features]
          }
        } as GeoJSONSourceSpecification);
      }
    };

    if (this.map.isStyleLoaded()) {
      addSource();
    } else {
      this.map.once("style.load", addSource);
    }
  }
}
