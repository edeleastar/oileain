export type IconType = {
  type: string;
  color: string;
};

export type IconLib = Record<string, IconType>;

export const OileainIconLib: IconLib = {
  // app icons
  oileain: { type: "noto:compass", color: "warning" },
  home: { type: "mdi:compass-rose", color: "primary" },
  navigator: { type: "ph:compass-tool-duotone", color: "error" },
  explorer: { type: "mdi:ruler-square-compass", color: "success" },
  island: { type: "arcticons:island", color: "error" },
  coast: { type: "flat-color-icons:landscape", color: "primary" },
  coasts: { type: "temaki:kayaking", color: "primary" },
  search: { type: "fluent:search-24-filled", color: "primary" },
  tutors: { type: "fa-solid:chalkboard-teacher", color: "bg-base-content" },
  lightMode: { type: "fluent:paint-brush-24-filled", color: "warning" },
  light: { type: "fluent:weather-sunny-32-filled", color: "warning" },
  dark: { type: "fluent:weather-moon-48-filled", color: "warning" },
  toc: { type: "fluent:line-horizontal-3-20-filled", color: "bg-base-content" },
  coursetree: { type: "ph:tree-view-duotone", color: "primary" },

  info: { type: "tabler:map-question", color: "secondary" },
  close: { type: "carbon:close-outline", color: "primary" },
  theme: { type: "fluent:color-fill-24-regular", color: "success" },
  default: { type: "fluent:re-order-dots-vertical-24-filled", color: "error" }
};

const colorMap: Record<string, string> = {
  primary: "var(--color-primary-500)",
  secondary: "var(--color-secondary-500)",
  tertiary: "var(--color-tertiary-500)",
  info: "var(--color-primary-500)",
  success: "var(--color-success-500)",
  warning: "var(--color-warning-500)",
  error: "var(--color-error-500)",
  surface: "var(--color-surface-500)"
};

export function getIconType(type: string): string {
  if (OileainIconLib[type]) {
    return OileainIconLib[type].type;
  }
  return OileainIconLib["default"].type;
}

export function getIconColour(type: string): string {
  if (OileainIconLib[type]) {
    const colour = OileainIconLib[type].color;
    return colorMap[colour] || "var(--color-primary-500)";
  }
  return "var(--color-primary-500";
}
