import { currentTheme, lightMode, mapProvider } from "$lib/runes.svelte";
import { OileainIconLib, type IconLib } from "./icons";

export type Theme = {
  name: string; // Theme name
  icons: IconLib; // Theme icons
};

export type MapProvider = {
  provider: string;
};

export const themeService = {
  themes: [
    { name: "oileain", icons: OileainIconLib },
    { name: "seafoam", icons: OileainIconLib },
    { name: "terminus", icons: OileainIconLib },
    { name: "rose", icons: OileainIconLib },
    { name: "cerberus", icons: OileainIconLib },
    { name: "vintage", icons: OileainIconLib }
  ] as Theme[],

  mapProviders: [{ provider: "Leaflet" }, { provider: "MapLibre" }] as MapProvider[],

  initDisplay(): void {
    const savedMode = localStorage.modeCurrent || "light";
    const savedTheme = localStorage.theme || "tutors";
    const savedMapProvider = localStorage.mapProvider || "leaflet";
    this.setDisplayMode(savedMode);
    this.setTheme(savedTheme);
    this.setMapProvider(savedMapProvider);
  },

  setDisplayMode(mode: string): void {
    if (typeof document === "undefined") return;

    if (!mode) {
      mode = "light";
    }
    lightMode.value = mode;
    localStorage.modeCurrent = mode;

    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  toggleDisplayMode(): void {
    if (lightMode.value === "dark") {
      this.setDisplayMode("light");
    } else {
      this.setDisplayMode("dark");
    }
  },

  setTheme(theme: string): void {
    if (typeof document === "undefined") return;

    if (!theme) {
      theme = "oileain";
    }
    const themeExists = themeService.themes.find((t) => t.name === theme);
    if (themeExists) {
      currentTheme.value = theme;
    } else {
      currentTheme.value = "oileain";
    }
    document.documentElement.setAttribute("data-theme", currentTheme.value);
    localStorage.theme = currentTheme.value;
  },

  setMapProvider(provider: string): void {
    mapProvider.value = provider;
    localStorage.mapProvider = provider;
  }
};
