<script lang="ts">
  import "leaflet/dist/leaflet.css";
  import { onMount } from "svelte";
  import type { Control, Layer, LayerGroup, Map as LeafletMap, Marker } from "leaflet";
  import type { MarkerLayer, MarkerSpec } from "../services/markers";
  import { markerSelected } from "$lib/runes.svelte";

  let {
    id = "home-map-id",
    height = 80,
    location = { lat: 53.2734, lng: -7.7783203 },
    zoom = 8,
    minZoom = 7,
    activeLayer = "Terrain",
    markerLayers = [] as MarkerLayer[],
    marker = {
      id: "",
      title: "",
      location: { lat: 53.2734, lng: -7.7783203 }
    } as MarkerSpec
  } = $props();

  let imap: LeafletMap;
  let control: Control.Layers;
  let overlays: Control.LayersObject = {};
  let baseLayers: any;
  let L: any;

  let markerMap = new Map<Marker, MarkerSpec>();

  onMount(async () => {
    const leaflet = await import("leaflet");
    L = leaflet.default;

    // Fix marker icons for Netlify deployment
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/images/marker-icon-2x.png",
      iconUrl: "/images/marker-icon.png",
      shadowUrl: "/images/marker-shadow.png"
    });
    baseLayers = {
      Terrain: leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      }),
      Satellite: leaflet.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        }
      )
    };
    let defaultLayer = baseLayers[activeLayer];
    imap = leaflet.map(id, {
      center: [location.lat, location.lng],
      zoom: zoom,
      minZoom: minZoom,
      layers: [defaultLayer]
    });
    control = leaflet.control.layers(baseLayers, overlays).addTo(imap);
    if (marker.id) {
      await addPopupMarkerAndZoom("default", marker);
    }
    if (markerLayers) {
      markerLayers.forEach((markerLayer) => {
        populateLayer(markerLayer);
      });
    }
  });

  export async function addPopupMarkerAndZoom(layer: string, marker: MarkerSpec) {
    if (imap) {
      addPopup(layer, marker.title, marker.location);
      moveTo(marker.location, 15);
    }
  }

  async function addPopup(layerTitle: string, content: string, location: any) {
    let popupGroup: LayerGroup;
    if (!overlays[layerTitle]) {
      popupGroup = L.layerGroup([]);
      overlays[layerTitle] = popupGroup;
      imap.addLayer(popupGroup);
    } else {
      popupGroup = overlays[layerTitle] as LayerGroup;
    }
    const popup = L.popup({
      closeOnClick: false,
      closeButton: false
    })
      .setLatLng({ lat: location.lat, lng: location.lng })
      .setContent(content);
    popup.addTo(popupGroup);
  }

  export async function addMarker(lat: number, lng: number, popupText: string) {
    const marker = L.marker([lat, lng]).addTo(imap);
    const popup = L.popup({ autoClose: false, closeOnClick: false });
    popup.setContent(popupText);
    marker.bindPopup(popup);
  }

  export async function moveTo(location: any, zoom: number = 0) {
    const leaflet = await import("leaflet");
    L = leaflet.default;
    if (zoom == 0) {
      imap.flyTo(location);
    } else {
      imap.flyTo(location, zoom);
    }
  }
  export function populateLayer(markerLayer: MarkerLayer) {
    let group = L.layerGroup([]);
    markerLayer.markerSpecs.forEach((markerSpec) => {
      let marker = L.marker([markerSpec.location.lat, markerSpec.location.lng]);
      var newpopup = L.popup({ autoClose: false, closeOnClick: false });
      const popupTitle = `<a href='/poi/${markerSpec.id}'>${markerSpec.title} <small>(click for details}</small></a>`;
      newpopup.setContent(popupTitle);
      marker.bindPopup(newpopup);
      marker.bindTooltip(markerSpec.title);
      marker.addTo(group);
      markerMap.set(marker, markerSpec);
      marker.addTo(group).on("popupopen", (event: any) => {
        const marker = event.popup._source;
        const markerSpec = markerMap.get(marker);
        markerSelected.value = markerSpec || null;
      });
    });
    addLayer(markerLayer.title, group);
    control.addOverlay(group, markerLayer.title);
  }

  function addLayer(title: string, layer: Layer) {
    overlays[title] = layer;
    imap.addLayer(layer);
  }
</script>

<div {id} style="height: {height}vh"></div>
