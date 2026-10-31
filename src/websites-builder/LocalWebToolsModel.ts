import type { WebCanvasBlockSeed, WebsiteProject } from "../WebsitesBuilderModel";

export type LocalWebsiteTool =
  | "image-optimizer"
  | "svg-icons"
  | "favicon"
  | "color-contrast"
  | "seo-preview"
  | "export";

export const LOCAL_WEBSITE_ICONS = [
  { id: "spark", label: "Destello", path: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zm7 11l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5zM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15z" },
  { id: "heart", label: "Corazón", path: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z" },
  { id: "arrow", label: "Flecha", path: "M5 12h14m-6-6 6 6-6 6" },
  { id: "check", label: "Check", path: "m5 12 4 4L19 6" },
  { id: "globe", label: "Globo", path: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm-9-10h18M12 2a15 15 0 0 1 0 20m0-20a15 15 0 0 0 0 20" },
  { id: "bolt", label: "Rayo", path: "m13 2-3 9h7L8 22l3-9H4l9-11z" },
] as const;

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.trim().replace(/^#/, "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((part) => part + part).join("")
    : normalized;
  if (!/^[\da-f]{6}$/i.test(expanded)) throw new Error("Usá un color hexadecimal válido.");
  return [0, 2, 4].map((index) => Number.parseInt(expanded.slice(index, index + 2), 16)) as [number, number, number];
}

function luminance(hex: string): number {
  const channels = hexToRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function getContrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function createSvgIconMarkup(iconId: string, color: string, size = 48): string {
  const icon = LOCAL_WEBSITE_ICONS.find((item) => item.id === iconId);
  if (!icon) throw new Error("Ícono no encontrado.");
  if (!/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color)) throw new Error("Color hexadecimal inválido.");
  const outline = icon.id === "arrow" || icon.id === "check" || icon.id === "globe";
  const shape = outline
    ? `<path d="${icon.path}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="${icon.path}" fill="${color}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" role="img" aria-label="${icon.label}">${shape}</svg>`;
}

export function createWebsiteExport(project: WebsiteProject | null, blocks: WebCanvasBlockSeed[]) {
  return {
    format: "digitalboost-websites-builder",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    project,
    canvas: blocks,
  };
}
