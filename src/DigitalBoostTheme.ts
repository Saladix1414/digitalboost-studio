
export type StoreTheme = {
  name: string; bg: string; surface: string; text: string; muted: string; primary: string; accent: string;
};
export const PRESETS: StoreTheme[] = [
  { name: "Nimbus", bg: "#F4F1EA", surface: "#FFFFFF", text: "#101820", muted: "#5C6570", primary: "#101820", accent: "#22D3EE" },
  { name: "Noir", bg: "#0A1020", surface: "#101B32", text: "#F7FAFF", muted: "#AFC0D5", primary: "#8B5CF6", accent: "#22D3EE" },
  { name: "Studio", bg: "#F7FAFF", surface: "#FFFFFF", text: "#0A1020", muted: "#7E90AA", primary: "#3B82F6", accent: "#EC4899" },
  { name: "Ember", bg: "#1A120C", surface: "#2A1C14", text: "#F7FAFF", muted: "#C4B5A0", primary: "#EC4899", accent: "#F59E0B" },
  { name: "Sage", bg: "#E8EDE4", surface: "#F7FAF4", text: "#1B2418", muted: "#5F6F58", primary: "#2F4F3A", accent: "#C4A574" },
  { name: "Sand", bg: "#EFE6D6", surface: "#FAF6EE", text: "#2A2118", muted: "#7A6A58", primary: "#8B4513", accent: "#D97706" },
  { name: "Ink", bg: "#0B0B0F", surface: "#16161D", text: "#F4F1EA", muted: "#9A96A8", primary: "#F4F1EA", accent: "#A3E635" }
];
const KEY = "db-store-theme-v1";
export function loadTheme(): StoreTheme {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return PRESETS[0];
    const parsed = JSON.parse(raw);
    return parsed && parsed.bg ? parsed : PRESETS[0];
  } catch { return PRESETS[0]; }
}
export function saveTheme(theme: StoreTheme) {
  try { localStorage.setItem(KEY, JSON.stringify(theme)); } catch {}
}
