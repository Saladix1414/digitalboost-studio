
export type PulseFacts = {
  store: string; range: string; live: boolean; page: string; theme: string;
  blocks: number; heroTitle: string; heroBody: string; heroCta: string;
  missingCta: number; genericHero: boolean; sales: number; orders: number; ticket: number;
  score: number; notes: string[]; map: string[];
};

function mul(range: string) { return range === "90d" ? 12 : range === "30d" ? 4 : 1; }
function money(n: number) { return "US$ " + n.toLocaleString("es-AR"); }

function ls(k: string, fb = "") { try { return localStorage.getItem(k) || fb; } catch { return fb; } }

function loadBlocks(page: string): any[] {
  try {
    const raw = ls("db-store-canvas-v1:" + page) || ls("db-store-canvas-v1") || "[]";
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}

export function toolInspect(input?: { store?: string; range?: string; live?: boolean }): PulseFacts {
  const store = ls("db-active-store-v1", (input && input.store) || "Nimbus");
  const range = ls("db-os-range-v1", (input && input.range) || "7d");
  const live = ls("db-os-live-v1", "1") !== "0";
  const page = ls("db-store-page-v1", "Inicio");
  const theme = ls("db-os-theme-v1", "nimbus");
  const blocks = loadBlocks(page);
  const hero = blocks.find(function (b) { return b && (b.type === "hero" || b.kind === "hero"); }) || blocks[0] || {};
  const heroTitle = String(hero.title || "");
  const heroBody = String(hero.body || hero.text || "");
  const heroCta = String(hero.cta || "");
  let missingCta = 0;
  const map: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i] || {};
    const t = String(b.type || b.kind || "bloque");
    const has = String(b.cta || "").trim();
    map.push((i + 1) + ". " + t + (b.title ? " «" + String(b.title).slice(0, 42) + "»" : "") + (has ? " · CTA" : " · sin CTA"));
    if ((t === "hero" || t === "featured" || t === "product" || t === "cta") && !has) missingCta++;
  }
  const genericHero = !heroTitle || heroTitle.length < 8 || /extraordinario|welcome|bienvenid|lorem|crea algo|nueva tienda|hello world/i.test(heroTitle);
  const m = mul(range);
  const sales = Math.round(474 * m);
  const orders = Math.max(1, Math.round(4 * m));
  const ticket = Math.round(118 * m);
  const notes: string[] = [];
  let score = 55;
  if (live) score += 8; else { score -= 10; notes.push("Live apagado"); }
  if (heroTitle && heroTitle.indexOf('permiso') !== -1) { score += 12; } else if (genericHero) { score -= 15; notes.push('Hero de plantilla'); } else score += 12;
  if (missingCta > 0) { score -= Math.min(18, missingCta * 6); notes.push(missingCta + " bloques sin CTA"); } else score += 10;
  if (heroCta) score += 5; else notes.push("Hero sin botón");
  if (blocks.length < 2) { score -= 8; notes.push("Canvas corto"); }
  if (theme === "noir") score += 2;
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return { store, range, live, page, theme, blocks: blocks.length, heroTitle, heroBody, heroCta, missingCta, genericHero, sales, orders, ticket, score, notes, map };
}

export function toolScoreLine(f: PulseFacts) {
  const band = f.score >= 80 ? "sano" : f.score >= 60 ? "justo" : "rojo";
  return "Score " + f.score + "/100 (" + band + ")";
}

export function toolMap(f: PulseFacts) {
  if (!f.map.length) return "No pude leer " + f.page + ". El canvas está vacío o no está guardado.";
  return "Así está armado " + f.page + " (" + f.blocks + " bloques):\n" + f.map.join("\n");
}

export function toolNba(f: PulseFacts): { title: string; body: string; action: string; label: string; draft?: { kind: string; title: string; body: string; cta: string } } {
  if (f.genericHero) {
    return {
      title: "PULSE · Siguiente golpe",
      body: "Lo primero es el hero. Hoy dice «" + (f.heroTitle || "—") + "» y se lee a plantilla.\nTe dejo una línea. La aplicás vos. Después unificamos botones y un solo theme (" + f.theme + ").",
      action: "website-builder",
      label: "Ir al canvas",
      draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" }
    };
  }
  if (f.missingCta > 0) {
    return {
      title: "PULSE · Siguiente golpe",
      body: "El hero ya habla. Lo barato ahora: " + f.missingCta + " bloque" + (f.missingCta === 1 ? "" : "s") + " sin un pedido claro.\nLos unifico a «Comprar ahora» si me das OK.",
      action: "website-builder",
      label: "Unificar CTA",
      draft: { kind: "cta", title: "CTA único", body: "Todos los botones dicen Comprar ahora.", cta: "Comprar ahora" }
    };
  }
  return {
    title: "PULSE · Siguiente golpe",
    body: "El canvas no es el problema.\nEl 1047 está cobrado y no sale, y el cap está justo.\nCampaña de carritos la armo, no la publico sola.",
    action: "orders",
    label: "Ir a Pedidos"
  };
}

export function toolOrders(f: PulseFacts) {
  return {
    title: "PULSE · Pedidos",
    body: "En " + f.store + " el 1048 ya está pago.\nEl 1047 sigue en preparación: plata cobrada que no sale.\nEl cuello es despacho, no la vitrina.",
    action: "orders",
    label: "Abrir Pedidos"
  };
}

export function toolStock(f: PulseFacts) {
  return {
    title: "PULSE · Stock",
    body: "El Cap Digital Blue está justo en " + f.store + ".\nAnotar el faltante es inocuo. Comprar al proveedor ya es una decisión tuya, no mía.",
    action: "products",
    label: "Abrir Productos"
  };
}

export function toolTheme(f: PulseFacts) {
  const next = f.theme === "noir" ? "Nimbus" : "Noir";
  return {
    title: "PULSE Design · Theme",
    body: "Ahora el canvas está en «" + f.theme + "».\nNimbus es calma. Noir es filo. Si mezclás los dos, la tienda no tiene cara.\nTe propongo pasar a " + next + ". Lo revertís con History.",
    action: "website-builder",
    label: "Aplicar theme",
    draft: { kind: "theme", title: next, body: "Preset " + next + " en todo el canvas.", cta: "Aplicar " + next }
  };
}

export function toolDiff(f: PulseFacts) {
  const proposed = "La colección que no pide permiso.";
  return {
    title: "PULSE Design · Diff",
    body: "Ahora: «" + (f.heroTitle || "—") + "».\nTe propongo: «" + proposed + "».\n" + (f.genericHero ? "La de ahora es plantilla." : "La de ahora ya tiene voz; esta es más corta.") + "\nSi te cierra, Aplicar. Si no, History.",
    action: "website-builder",
    label: "Aplicar hero",
    draft: { kind: "hero", title: proposed, body: "Una promesa. Un botón.", cta: "Entrar" }
  };
}

export function toolRange(f: PulseFacts) {
  const a = mul("7d"), b = mul("30d"), c = mul("90d");
  return {
    title: "PULSE · Rangos",
    body: "Cálculo de demo, no pasarela. 7d " + money(474 * a) + " / " + Math.max(1, 4 * a) + " pedidos. 30d " + money(474 * b) + " / " + Math.max(1, 4 * b) + ". 90d " + money(474 * c) + " / " + Math.max(1, 4 * c) + ". Estás en " + f.range + ". El cuello (1047, cap) no cambia al alargar el rango.",
    action: "analytics",
    label: "Abrir Analytics"
  };
}

export function moneyFmt(n: number) { return money(n); }
