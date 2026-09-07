import { classifyRisk, isWrite, pickAgent } from "./DigitalBoostPulseConst";
import { approvalCard } from "./DigitalBoostPulseCard";
import { countExamples, dumpJSONL, pushExample } from "./DigitalBoostPulseLog";
import { bestDistance, fuzzyHit } from "./DigitalBoostPulseLev";
import { skillAlerta, skillBriefing, skillHero, skillPlan } from "./DigitalBoostPulseSkills";

export type PulseInput = {
  q: string;
  section: string;
  store: string;
  range: string;
  live: boolean;
  page?: string;
  blockCount?: number;
  heroTitle?: string;
};
export type PulseDecision = {
  title: string;
  body: string;
  action: string;
  actionLabel: string;
  confirm: boolean;
  risk?: string;
  agent?: string;
  card?: unknown;
};

let lastAction = "dashboard";

function st(i: PulseInput) {
  return i.store + " · " + i.range + (i.live ? " · live" : " · atención");
}
function mul(i: PulseInput) {
  return i.range === "90d" ? 12 : i.range === "30d" ? 4 : 1;
}
function money(n: number) {
  return "US$ " + n.toLocaleString("es-AR");
}

type Pack = { title: string; body: string; action: string; label: string; confirm?: boolean; score: number };

function score(q: string, keys: string[]) {
  let s = 0;
  for (let i = 0; i < keys.length; i++) {
    if (q.indexOf(keys[i]) !== -1) s += keys[i].length > 4 ? 2 : 1;
    else if (fuzzyHit(q, keys[i])) s += 1;
  }
  return s;
}

export function decide(input: PulseInput): PulseDecision {
  const inStudio = input.section === "website-builder" || input.section === "store-builder" || input.section === "builder";
  const qn = expand((input.q || "").toLowerCase().trim());
  if (inStudio && (!qn || qn.indexOf("hola") !== -1 || qn.indexOf("quien") !== -1 || qn.indexOf("sos") !== -1)) {
    return { title: "PULSE Design", body: "Estamos en el canvas de " + input.store + ". El hero sigue genérico. ¿Lo reescribimos, cambiamos theme, o miramos los CTA?", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
  }

  const q0 = (input.q || "").toLowerCase();
  if (q0.indexOf("dataset") !== -1 || q0.indexOf("jsonl") !== -1) {
    const n = countExamples();
    try { (window as any).__pulseJSONL = dumpJSONL(); } catch {}
    return { title: "PULSE · Dataset LoRA", body: n + " ejemplos en este navegador. JSONL listo en window.__pulseJSONL. Eso entra a Unsloth en Colab, no acá.", action: "dashboard", actionLabel: "Seguir", confirm: false };
  }

  const raw = (input.q || "").toLowerCase().trim();
  if (raw.indexOf("brief") !== -1 || raw === "estado" || raw === "resumen") return skillBriefing(input);
  if (raw.indexOf("plan") !== -1 || raw === "que hago" || raw.indexOf("prioridad") !== -1) return skillPlan(input);
  if (raw.indexOf("alerta") !== -1 || raw.indexOf("urgente") !== -1 || raw.indexOf("rojo") !== -1) return skillAlerta(input);
  if (raw === "hero" || raw.indexOf("arreglar hero") !== -1) return skillHero();

  let q = (input.q || "").toLowerCase().trim();
  if (q === "ok" || q === "si" || q === "sí" || q === "y eso" || q === "mas" || q === "más") {
    q = lastAction === "orders" ? "pedidos" : lastAction === "products" ? "stock" : lastAction === "analytics" ? "ventas" : lastAction === "__health" ? "health" : lastAction === "website-builder" ? "hero" : "hola";
  }

  const m = mul(input);
  const salesN = Math.round(474 * m);
  const ordersN = Math.max(1, Math.round(4 * m));
  const ticket = Math.round(118 * m);
  const idHit = q.match(/db-?\s?10\d{2}/);
  const packs: Pack[] = [];

  function add(keys: string[], title: string, body: string, action: string, label: string, confirm?: boolean) {
    const s = score(q, keys);
    if (s > 0) packs.push({ title: title, body: body, action: action, label: label, confirm: confirm, score: s });
  }

  add(["hola", "quien", "sos", "pulse"], "PULSE", st(input) + ". ¿Ventas, pedidos, stock o el canvas?", "dashboard", "Seguir acá");
  add(["venta", "plata", "ingreso", "analytics", "factur"], "PULSE · Ventas", st(input) + ". " + money(salesN) + " · " + ordersN + " pedidos · ticket " + money(ticket) + ". Mobile recorta. ¿Abro Analytics?", "analytics", "Abrir Analytics");
  add(["pedido", "orden", "envio", "despacho", "1048", "1047"], "PULSE · Pedidos", idHit ? ("Encontré " + idHit[0].toUpperCase() + ". Pagado o en preparación: el cuello es despacho.") : ("DB-1048 pagado, 1047 en preparación. " + ordersN + " en el tramo. El cuello no es la vitrina. ¿Despacho o stock?"), "orders", "Abrir Pedidos");
  add(["stock", "invent", "sku", "producto", "cap", "hoodie"], "PULSE · Stock", "Cap Digital Blue fino, Hoodie Violet en 7. Si no reponés, el drop vende vacío.", "products", "Abrir Productos");
  add(["cliente", "vip", "martin", "sofia"], "PULSE · Clientes", "Martín y Camila concentran gasto. Tag VIP, no otra campaña masiva.", "customers", "Abrir Clientes");
  add(["health", "salud", "error", "caido", "diagnost"], "PULSE · Health", "Checkout y stock piden ojo. Te abro el diagnóstico.", "__health", "Abrir Store Health");
  add(["buscar", "search", "encontrar"], "PULSE · Search", "Te abro Search: pedidos, productos, comandos.", "__search", "Abrir Search");
  add(["automat", "flujo", "trigger"], "PULSE · Flujos", "Trigger → condición → acción. Te abro Automations.", "__automations", "Abrir Automations");
  add(["integr", "stripe", "mailchimp"], "PULSE · Integrations", "Connect / Disconnect del marketplace.", "__integrations", "Abrir Integrations");
  add(["console", "log", "huella"], "PULSE · Console", "Te abro Operations Console.", "__console", "Abrir Console");
  add(["campan", "promo", "descuento", "cupon"], "PULSE · Campaña", "Carritos abandonados, 10% / 48h. Confirmá y armo el frente en Marketing.", "campaigns", "Crear campaña", true);
  add(["hero", "homepage", "titulo", "redisen", "canvas"], "PULSE Design", "Hero: 3 segundos, una promesa, un CTA. AI Design lo escribe en el canvas.", "website-builder", "Abrir Store Builder");
  add(["theme", "noir", "color", "preset"], "PULSE Design", "Nimbus calma · Noir precisión. Chip Theme en el studio.", "website-builder", "Seguir en el canvas");
  add(["conver", "cta", "comprar"], "PULSE Design", "Todo bloque sin CTA es ruido. Hero, productos, cierre.", "website-builder", "Abrir Store Builder");
  add(["live", "attention", "caida"], "PULSE · Status", st(input) + ". Live/Attention se cambia en el header.", "dashboard", "Overview");

  packs.sort(function (a, b) { return b.score - a.score; });

  let pick: Pack;
  if (!packs.length) {
    if (input.section === "orders") pick = { title: "PULSE · Pedidos", body: "Estás en pedidos. 1048 pagado, 1047 en preparación.", action: "orders", label: "Seguir en Pedidos", score: 1 };
    else if (input.section === "website-builder") pick = { title: "PULSE Design", body: (input.heroTitle ? ("Hero actual: «" + input.heroTitle + "». ¿Lo reescribimos o cambiamos theme?") : "El canvas está listo. ¿Hero, theme o CTA?"), action: "website-builder", label: "Seguir en el canvas", score: 1 };
    else pick = { title: "PULSE", body: "¿Cifras del OS o el canvas? Decime ventas, 1048, o hero.", action: input.section || "dashboard", label: "Seguir acá", score: 0 };
  } else if (packs.length > 1 && packs[0].score === packs[1].score && packs[0].action !== packs[1].action) {
    pick = {
      title: "PULSE",
      body: packs[0].body + " También: " + packs[1].title.replace("PULSE · ", "").replace("PULSE Design", "canvas") + ".",
      action: packs[0].action,
      label: packs[0].label,
      confirm: packs[0].confirm,
      score: packs[0].score
    };
  } else {
    pick = packs[0];
  }

  lastAction = pick.action;
  const write = isWrite(pick.action);
  const risk = classifyRisk(pick.action, write);
  const agent = pickAgent(input.section, input.q || "");
  const confirm = Boolean(pick.confirm) || risk === "L2" || risk === "L3" || risk === "L4";
  const card = confirm ? approvalCard({
    risk: risk,
    name: pick.title,
    summary: pick.body.slice(0, 160),
    reason: "Write o riesgo " + risk + ". Gobernanza PULSE 3.0.",
    tool: pick.action
  }) : undefined;

  try {
    pushExample({ q: input.q || "", section: input.section, store: input.store, range: input.range, live: input.live, title: pick.title, body: pick.body, action: pick.action, confirm: Boolean(pick.confirm) });
  } catch {}
  try { localStorage.setItem("db-pulse-last", pick.action); } catch {}
  return { title: pick.title, body: pick.body + (confirm ? " · Requiere aprobacion (" + risk + " / " + agent + ")." : " · " + agent + " · " + risk), action: pick.action, actionLabel: confirm ? "Revisar Pulse Card" : pick.label, confirm: confirm, risk: risk, agent: agent, card: card };
}


export function explain(input: PulseInput): PulseDecision {
  const q = (input.q || "").toLowerCase().trim() || "ventas y stock";
  const keys: { title: string; ks: string[] }[] = [
    { title: "Hola", ks: ["hola", "quien", "sos", "pulse"] },
    { title: "Ventas", ks: ["venta", "plata", "ingreso", "analytics", "factur"] },
    { title: "Pedidos", ks: ["pedido", "orden", "envio", "despacho", "1048", "1047"] },
    { title: "Stock", ks: ["stock", "invent", "sku", "producto", "cap", "hoodie"] },
    { title: "Clientes", ks: ["cliente", "vip", "martin", "sofia"] },
    { title: "Health", ks: ["health", "salud", "error", "diagnost"] },
    { title: "Search", ks: ["buscar", "search"] },
    { title: "Campaña", ks: ["campan", "promo"] },
    { title: "Hero", ks: ["hero", "homepage", "redisen", "canvas"] },
    { title: "Theme", ks: ["theme", "noir", "color"] },
    { title: "Briefing", ks: ["brief", "estado", "resumen"] },
    { title: "Plan", ks: ["plan", "prioridad"] },
    { title: "Alerta", ks: ["alerta", "urgente", "rojo"] }
  ];
  const ranked = keys.map(function (row) {
    let s = 0;
    const hit: string[] = [];
    for (let i = 0; i < row.ks.length; i++) {
      if (q.indexOf(row.ks[i]) !== -1 || fuzzyHit(q, row.ks[i])) {
        s += row.ks[i].length > 4 ? 2 : 1;
        hit.push(row.ks[i]);
      }
    }
    return { title: row.title, score: s, hit: hit };
  }).filter(function (r) { return r.score > 0; }).sort(function (a, b) { return b.score - a.score; });
  const win = ranked[0];
  const rank = ranked.map(function (r) { return r.score + "pts " + r.title + (r.hit.length ? " [" + r.hit.join(",") + "]" : ""); }).join(" · ");
  const dist = ranked[0] ? bestDistance(q, ranked[0].hit[0] || "") : 99;
  return {
    title: "PULSE · Debug",
    body: "Query «" + q + "» lev=" + dist + ". " + (win ? ("Ganó " + win.title + " con " + win.score + " pts. Ranking: " + rank) : "Nadie matcheó. Caería a fallback de sección."),
    action: "dashboard",
    actionLabel: "Seguir acá",
    confirm: false
  };
}
