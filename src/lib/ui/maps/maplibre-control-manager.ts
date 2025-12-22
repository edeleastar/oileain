import type { Map as MapLibreMap } from "maplibre-gl";

// Keep this local to avoid a circular dependency on maplibre-map.ts
type BaseLayersLike = Record<string, string | object>;

export class MapLibreControlManager {
  private map: MapLibreMap | null = null;
  private container: HTMLElement | null = null;

  initialize(map: MapLibreMap): void {
    this.map = map;
  }

  /**
   * Builds the complete control element, including base layer section and the provided overlay section.
   */
  buildControl(
    baseLayers: BaseLayersLike,
    activeLayerName: string,
    onBaseLayerChange: (layerName: string) => void,
    overlaySection: HTMLElement
  ): HTMLElement {
    const control = this.createControlContainer();
    control.appendChild(this.createBaseLayerSection(baseLayers, activeLayerName, onBaseLayerChange));
    control.appendChild(overlaySection);
    return control;
  }

  attach(control: HTMLElement): void {
    if (!this.map) return;

    const mapContainer = this.map.getContainer();
    const controlContainer = document.createElement("div");
    controlContainer.className = "maplibregl-ctrl-top-left";
    controlContainer.style.cssText = "position: absolute; top: 10px; left: 10px; z-index: 1000;";
    controlContainer.appendChild(control);
    mapContainer.appendChild(controlContainer);

    this.container = controlContainer;
  }

  destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.map = null;
  }

  private createControlContainer(): HTMLElement {
    const control = document.createElement("div");
    control.className = "maplibregl-ctrl maplibregl-ctrl-group";
    control.style.cssText = `
      background: white;
      border-radius: 4px;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
      padding: 10px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      max-width: 200px;
    `;
    return control;
  }

  private createBaseLayerSection(
    baseLayers: BaseLayersLike,
    activeLayerName: string,
    onBaseLayerChange: (layerName: string) => void
  ): HTMLElement {
    const baseLayersDiv = document.createElement("div");
    baseLayersDiv.style.marginBottom = "10px";

    const baseLayersLabel = this.createSectionLabel("Base Layers");
    baseLayersDiv.appendChild(baseLayersLabel);

    Object.keys(baseLayers).forEach((layerName) => {
      baseLayersDiv.appendChild(this.createBaseLayerRadio(layerName, activeLayerName === layerName, onBaseLayerChange));
    });

    return baseLayersDiv;
  }

  private createSectionLabel(text: string): HTMLElement {
    const label = document.createElement("div");
    label.textContent = text;
    label.style.fontWeight = "bold";
    label.style.marginBottom = "5px";
    return label;
  }

  private createBaseLayerRadio(
    layerName: string,
    isActive: boolean,
    onBaseLayerChange: (layerName: string) => void
  ): HTMLElement {
    const label = document.createElement("label");
    label.style.cssText = "display: block; margin: 3px 0; cursor: pointer;";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "baseLayer";
    input.value = layerName;
    input.checked = isActive;

    input.addEventListener("change", () => {
      if (input.checked) {
        onBaseLayerChange(layerName);
      }
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${layerName}`));
    return label;
  }
}
