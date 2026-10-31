import { websiteProjectToCanvasBlocks, type WebCanvasBlockSeed, type WebsiteProject } from "../WebsitesBuilderModel.ts";

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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] as string);
}

function safeColor(value: string, fallback: string): string {
  return /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value) ? value : fallback;
}

function safeNumber(value: number | undefined, fallback: number, min: number, max: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function safeMediaDataUrl(value: string | undefined): string | null {
  return value && /^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/]+=*$/.test(value) ? value : null;
}

function renderHtmlBlocks(blocks: WebCanvasBlockSeed[], tokens: WebsiteProject["designTokens"]): string {
  const surface = safeColor(tokens.surface, "#ffffff");
  const foreground = safeColor(tokens.foreground, "#0f172a");
  const accent = safeColor(tokens.accent, "#2563eb");
  const accentForeground = safeColor(tokens.accentForeground, "#ffffff");
  const radius = safeNumber(tokens.radius, 16, 0, 64);

  return blocks.filter((block) => !block.hidden).map((block) => {
    const blockBackground = safeColor(block.background, surface);
    const blockColor = safeColor(block.color, foreground);
    const fontSize = safeNumber(block.fontSize, 18, 10, 96);
    const paddingY = safeNumber(block.paddingY ?? block.padding, 32, 0, 240);
    const paddingX = safeNumber(block.paddingX ?? block.padding, 32, 0, 240);
    const blockRadius = safeNumber(block.borderRadius, radius, 0, 64);
    const align = block.align === "center" || block.align === "right" ? block.align : "left";
    const isButton = block.type === "button";
    const className = isButton ? "content-block content-cta" : "content-block";
    const media = block.type === "image" ? safeMediaDataUrl(block.mediaDataUrl) : null;
    const body = media ? '<img src="' + media + '" alt="' + escapeHtml(block.mediaAlt || block.text || block.label) + '" style="display:block;max-width:100%;max-height:640px;height:auto;object-fit:contain;margin:auto">' : escapeHtml(block.text);
    return '<section class="' + className + '" aria-label="' + escapeHtml(block.label) + '" style="background:' + (isButton ? accent : blockBackground) + ';color:' + (isButton ? accentForeground : blockColor) + ';font-size:' + fontSize + 'px;text-align:' + align + ';padding:' + paddingY + 'px ' + paddingX + 'px;border-radius:' + blockRadius + 'px">' + body + '</section>';
  }).join("\n");
}

export function createWebsitePageHtml(
  project: WebsiteProject,
  pageId: string,
  blocks: WebCanvasBlockSeed[]
): { filename: string; html: string } {
  const page = project.pages.find((entry) => entry.id === pageId) ?? project.pages[0];
  if (!page) throw new Error("El proyecto no tiene páginas para exportar.");

  const tokens = project.designTokens;
  const background = safeColor(tokens.background, "#f8fafc");
  const foreground = safeColor(tokens.foreground, "#0f172a");
  const surface = safeColor(tokens.surface, "#ffffff");
  const muted = safeColor(tokens.muted, "#64748b");
  const container = safeNumber(tokens.container, 1200, 320, 2400);
  const content = renderHtmlBlocks(blocks, tokens);

  const title = escapeHtml(page.seo.title || page.title || page.name);
  const description = escapeHtml(page.seo.description || page.description);
  const robots = page.seo.indexable ? "index,follow" : "noindex,nofollow";
  const safeSlug = page.slug.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9-]+/g, "-") || "home";
  const html = [
    "<!doctype html>",
    '<html lang="es">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <meta name="description" content="' + description + '">',
    '  <meta name="robots" content="' + robots + '">',
    ...(safeMediaDataUrl(project.faviconDataUrl) ? ['  <link rel="icon" href="' + safeMediaDataUrl(project.faviconDataUrl) + '">'] : []),
    "  <title>" + title + "</title>",
    "  <style>",
    "    *{box-sizing:border-box}body{margin:0;background:" + background + ";color:" + foreground + ';font:16px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    "    header,main,footer{width:min(calc(100% - 40px)," + container + "px);margin-inline:auto}",
    "    header{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:24px 0;border-bottom:1px solid " + safeColor(tokens.border, "#e2e8f0") + "}",
    "    header strong{font-size:18px}main{padding:32px 0 64px}.content-block{margin:14px 0;background:" + surface + ";color:" + foreground + ";box-shadow:0 8px 28px rgba(15,23,42,.06);white-space:pre-wrap;overflow-wrap:anywhere}",
    "    .content-cta{display:inline-block;font-weight:700;box-shadow:none}footer{padding:20px 0 36px;color:" + muted + ";font-size:13px}",
    "    @media(max-width:600px){header,main,footer{width:min(calc(100% - 28px)," + container + "px)}header{align-items:flex-start;flex-direction:column}.content-block{padding:24px 18px!important}}",
    "  </style>",
    "</head>",
    "<body>",
    "  <header><strong>" + escapeHtml(project.name) + "</strong></header>",
    "  <main><h1>" + escapeHtml(page.title || page.name) + "</h1>" + (content || "<p>" + escapeHtml(page.description || "Esta página todavía no tiene secciones.") + "</p>") + "</main>",
    "  <footer>" + escapeHtml(project.name) + " · Página " + escapeHtml(page.name) + "</footer>",
    "</body>",
    "</html>",
  ].join("\n");
  return { filename: "digitalboost-" + safeSlug + ".html", html };
}

export function createWebsiteProjectPreviewHtml(project: WebsiteProject): { filename: string; html: string } {
  if (!project.pages.length) throw new Error("El proyecto no tiene páginas para exportar.");

  const tokens = project.designTokens;
  const background = safeColor(tokens.background, "#f8fafc");
  const foreground = safeColor(tokens.foreground, "#0f172a");
  const surface = safeColor(tokens.surface, "#ffffff");
  const muted = safeColor(tokens.muted, "#64748b");
  const border = safeColor(tokens.border, "#e2e8f0");
  const container = safeNumber(tokens.container, 1200, 320, 2400);
  const pageData = project.pages.map((page, index) => {
    const blocks = websiteProjectToCanvasBlocks(project, page.id);
    const pageTitle = page.seo.title || page.title || page.name;
    const pageDescription = page.seo.description || page.description;
    const pageContent = renderHtmlBlocks(blocks, tokens)
      || "<p>" + escapeHtml(page.description || "Esta página todavía no tiene secciones.") + "</p>";
    const hidden = index === 0 ? "" : " hidden";
    const current = index === 0 ? ' aria-current="page"' : "";
    return {
      nav: '<button type="button" class="page-link" data-page-target="' + index + '" data-page-title="' + escapeHtml(pageTitle) + '" data-page-description="' + escapeHtml(pageDescription) + '"' + current + '>' + escapeHtml(page.name) + '</button>',
      view: '<article class="page-view" data-page-view="' + index + '"' + hidden + '><p class="page-kicker">' + escapeHtml(page.slug) + '</p><h1>' + escapeHtml(page.title || page.name) + '</h1>' + pageContent + '</article>',
    };
  });

  const firstPage = project.pages[0];
  const initialTitle = escapeHtml(firstPage.seo.title || firstPage.title || firstPage.name);
  const initialDescription = escapeHtml(firstPage.seo.description || firstPage.description);
  const html = [
    "<!doctype html>",
    '<html lang="es">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <meta name="description" content="' + initialDescription + '">',
    '  <meta name="robots" content="noindex,nofollow">',
    ...(safeMediaDataUrl(project.faviconDataUrl) ? ['  <link rel="icon" href="' + safeMediaDataUrl(project.faviconDataUrl) + '">'] : []),
    "  <title>" + initialTitle + " · " + escapeHtml(project.name) + "</title>",
    "  <style>",
    "    *{box-sizing:border-box}body{margin:0;background:" + background + ";color:" + foreground + ';font:16px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    "    .site-header,.site-main,.site-footer{width:min(calc(100% - 40px)," + container + "px);margin-inline:auto}",
    "    .site-header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;padding:20px 0;border-bottom:1px solid " + border + "}",
    "    .brand{font-size:18px;font-weight:800}.page-nav{display:flex;flex-wrap:wrap;gap:8px}.page-link{border:1px solid " + border + ";border-radius:999px;padding:8px 13px;background:" + surface + ";color:" + foreground + ";font:inherit;font-size:13px;cursor:pointer}",
    "    .page-link[aria-current=page]{border-color:" + safeColor(tokens.accent, "#2563eb") + ";background:" + safeColor(tokens.accent, "#2563eb") + ";color:" + safeColor(tokens.accentForeground, "#ffffff") + "}",
    "    .site-main{min-height:65vh;padding:36px 0 64px}.page-view[hidden]{display:none}.page-view h1{margin:0 0 22px;font-size:clamp(30px,5vw,56px);line-height:1.08;letter-spacing:-.04em}.page-kicker{margin:0 0 10px;color:" + muted + ";font-size:12px}",
    "    .content-block{margin:14px 0;background:" + surface + ";color:" + foreground + ";box-shadow:0 8px 28px rgba(15,23,42,.06);white-space:pre-wrap;overflow-wrap:anywhere}.content-cta{display:inline-block;font-weight:700;box-shadow:none}",
    "    .site-footer{padding:20px 0 36px;border-top:1px solid " + border + ";color:" + muted + ";font-size:13px}",
    "    @media(max-width:600px){.site-header,.site-main,.site-footer{width:min(calc(100% - 28px)," + container + "px)}.site-header{align-items:flex-start;flex-direction:column}.page-nav{width:100%}.page-link{font-size:12px}.content-block{padding:24px 18px!important}}",
    "  </style>",
    "</head>",
    "<body>",
    "  <header class=\"site-header\"><strong class=\"brand\">" + escapeHtml(project.name) + "</strong><nav class=\"page-nav\" aria-label=\"Páginas del sitio\">" + pageData.map((entry) => entry.nav).join("") + "</nav></header>",
    "  <main class=\"site-main\">" + pageData.map((entry) => entry.view).join("\n") + "</main>",
    "  <footer class=\"site-footer\">Vista local multipágina · " + escapeHtml(project.name) + "</footer>",
    "  <script>",
    "    document.querySelectorAll('[data-page-target]').forEach(function(button){button.addEventListener('click',function(){var target=button.dataset.pageTarget;document.querySelectorAll('[data-page-view]').forEach(function(view){view.hidden=view.dataset.pageView!==target});document.querySelectorAll('[data-page-target]').forEach(function(item){if(item===button)item.setAttribute('aria-current','page');else item.removeAttribute('aria-current')});document.title=button.dataset.pageTitle+' · '+document.querySelector('.brand').textContent;document.querySelector('meta[name=description]').content=button.dataset.pageDescription||''})});",
    "  </script>",
    "</body>",
    "</html>",
  ].join("\n");
  return { filename: "digitalboost-site-preview.html", html };
}
