import { routeTools } from "./DigitalBoostPulseRouter";
import { toolInspect, toolScoreLine } from "./DigitalBoostPulseTools";

import { runCycle } from "./DigitalBoostPulseCycle";
import type { PulseDecisionEnvelope, PulseApproval } from "./DigitalBoostPulseGovernance";
import { countExamples, dumpJSONL, pushExample } from "./DigitalBoostPulseLog";
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
  draft?: { kind: string; title: string; body: string; cta: string };
  proposal?: Record<string, unknown> | null;
  risk?: string;
  agent?: string;
  intent?: string;
  card?: unknown;
  envelope?: PulseDecisionEnvelope;
  approval?: PulseApproval | null;
};

let lastAction = "dashboard";

function fold(s: string) {
  return (s || "").toLowerCase()
    .replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i")
    .replace(/ó/g, "o").replace(/ú/g, "u").replace(/ü/g, "u").replace(/ñ/g, "n");
}
const SYN: Record<string, string> = {
  facturacion: "ventas", ingreso: "ventas", plata: "ventas",
  inventario: "stock", deposito: "stock", catalogo: "productos",
  envio: "pedidos", despacho: "pedidos", orden: "pedidos",
  descuento: "campana", promo: "campana",
  portada: "hero", home: "hero",
  resumen: "briefing", estado: "briefing",
  urgente: "alerta", rojo: "alerta"
};
function expand(q: string) {
  const f = fold(q);
  const toks = f.split(/[^a-z0-9]+/).filter(Boolean);
  const extra: string[] = [];
  for (let i = 0; i < toks.length; i++) if (SYN[toks[i]]) extra.push(SYN[toks[i]]);
  return extra.length ? f + " " + extra.join(" ") : f;
}
function st(i: PulseInput) {
  return i.store + " · " + i.range + (i.live ? " · live" : " · atencion");
}
function mul(i: PulseInput) {
  return i.range === "90d" ? 12 : i.range === "30d" ? 4 : 1;
}
function money(n: number) {
  return "US$ " + n.toLocaleString("es-AR");
}
function score(q: string, keys: string[]) {
  let s = 0;
  for (let i = 0; i < keys.length; i++) {
    if (q.indexOf(keys[i]) !== -1) s += keys[i].length > 4 ? 2 : 1;
  }
  return s;
}
type Pack = { title: string; body: string; action: string; label: string; confirm?: boolean; score: number };

function finish(
  input: PulseInput,
  pick: {
    title: string;
    body: string;
    action: string;
    label: string;
    confirm?: boolean;
    proposal?: Record<string, unknown> | null;
  },
): PulseDecision {
  const meta = runCycle({
    q: input.q || "",
    section: input.section,
    store: input.store,
    action: pick.action,
    title: pick.title,
    body: pick.body,
    alreadyConfirm: Boolean(pick.confirm)
  });
  lastAction = pick.action;
  try {
    pushExample({
      q: input.q || "",
      section: input.section,
      store: input.store,
      range: input.range,
      live: input.live,
      title: pick.title,
      body: pick.body,
      action: pick.action,
      confirm: meta.confirm
    });
  } catch {}
  return {
    title: pick.title,
    body: pick.body,
    action: pick.action,
    actionLabel: meta.confirm ? "Revisar Pulse Card" : pick.label,
    confirm: meta.confirm,
    risk: meta.risk,
    agent: meta.agent,
    intent: meta.intent,
    card: meta.card,
    envelope: meta.envelope,
    approval: meta.approval,
    draft: (pick as any).draft,
    proposal: (pick as any).proposal || null
  };
}

export function decide(input: PulseInput): PulseDecision {
  const facts = toolInspect(input);
  if (!input.heroTitle) input.heroTitle = facts.heroTitle;
  if (!input.blockCount) input.blockCount = facts.blocks;
  if (!input.page) input.page = facts.page;
  let q = expand(input.q || "");

  const inStudio = input.section === "website-builder" || input.section === "store-builder" || input.section === "builder";
  if (q === "ok" || q === "si" || q === "mas") {
    q = lastAction === "orders" ? "pedidos" : lastAction === "products" ? "stock" : lastAction === "analytics" ? "ventas" : lastAction === "website-builder" ? "hero" : "hola";
  }
  if (q.indexOf("inspecc") !== -1 || q === "score" || q.indexOf("auditar") !== -1) {
    const f = facts;
    return finish(input, {
      title: "PULSE · Inspect",
      body: toolScoreLine(f) + ". " + f.store + " · " + f.page + " · " + f.blocks + " bloques. Hero: «" + (f.heroTitle || "—") + "». " + (f.notes.length ? f.notes.join(". ") + "." : "Sin notas.") + " Esto salió de localStorage, no lo inventé.",
      action: input.section === "website-builder" ? "website-builder" : "dashboard",
      label: "Seguir"
    });
  }
  const routed = routeTools(input, q, finish);
  if (routed) return routed;
  if (q.indexOf("dataset") !== -1 || q.indexOf("jsonl") !== -1) {
    const n = countExamples();
    try { (window as any).__pulseJSONL = dumpJSONL(); } catch {}
    return finish(input, { title: "PULSE · Dataset", body: n + " ejemplos. JSONL en window.__pulseJSONL para Unsloth/Colab. Llama sigue secundaria.", action: "dashboard", label: "Seguir" });
  }
  if (q.indexOf("brief") !== -1 || q === "estado" || q === "resumen") return finish(input, skillBriefing(input));
  if (q.indexOf("plan") !== -1 || q.indexOf("prioridad") !== -1) return finish(input, skillPlan(input));
  if (q.indexOf("alerta") !== -1 || q.indexOf("urgente") !== -1) return finish(input, skillAlerta(input));
  if (q === "hero" || q.indexOf("arreglar hero") !== -1) return finish(input, skillHero(input));

  if (inStudio && (!q || q.indexOf("hola") !== -1 || q.indexOf("quien") !== -1)) {
    const hero = input.heroTitle ? "Hero actual: «" + input.heroTitle + "». " : "El hero sigue generico. ";
    return finish(input, { title: "PULSE Design", body: "Canvas " + input.store + " · " + (input.page || "Inicio") + " · " + String(input.blockCount || 0) + " bloques. " + hero + "¿Lo reescribimos, cambiamos theme, o miramos los CTA?", action: "website-builder", label: "Seguir en el canvas" });
  }

  const m = mul(input);
  const salesN = Math.round(474 * m);
  const ordersN = Math.max(1, Math.round(4 * m));
  const ticket = Math.round(118 * m);
  const packs: Pack[] = [];
  function add(keys: string[], title: string, body: string, action: string, label: string, confirm?: boolean) {
    const s = score(q, keys);
    if (s > 0) packs.push({ title: title, body: body, action: action, label: label, confirm: confirm, score: s });
  }
  add(["hola", "quien", "sos", "pulse"], "PULSE", st(input) + ". Orquestador del OS. ¿Briefing del dia, un pedido, o el canvas?", "dashboard", "Seguir aca");
  add(["venta", "plata", "ingreso", "analytics", "factur"], "PULSE · Ventas", "" + st(input) + ". " + money(salesN) + " · " + ordersN + " pedidos · ticket " + money(ticket) + ". Mobile recorta. ¿Abro Analytics?", "analytics", "Abrir Analytics");
  add(["pedido", "orden", "envio", "despacho", "1048", "1047"], "PULSE · Pedidos", "El 1048 está pagado. El 1047 sigue en preparación: el cuello es despacho, no la vitrina. Cada hora ahí es plata cobrada que no sale. ¿Entro a Pedidos?", "orders", "Abrir Pedidos");
  add(["stock", "invent", "sku", "producto", "cap"], "PULSE · Stock", "El Cap Digital Blue está fino. Si el drop llega sin reposición, la ficha se ve y no hay talle. Anotar el faltante es L0; comprar al proveedor ya sería L3 y Pulse Card. ¿Abrimos Productos?", "products", "Abrir Productos");
  add(["cliente", "vip", "martin"], "PULSE · Clientes", "RECOMENDACION: valor concentrado. Tag VIP, no campana masiva.", "customers", "Abrir Clientes");
  add(["health", "salud", "error", "diagnost"], "PULSE · Health", "Alerta operativa. Te abro el diagnostico. No ejecuto cambios.", "__health", "Abrir Store Health");
  add(["buscar", "search"], "PULSE · Search", "Te abro Search del OS.", "__search", "Abrir Search");
  add(["automat", "flujo"], "PULSE · Flujos", "L1: preparar flujos. Activarlos puede pedir aprobacion.", "__automations", "Abrir Automations");
  add(["integr", "stripe"], "PULSE · Integrations", "L4 de gobernanza si se tocan credenciales. Solo abro el panel.", "__integrations", "Abrir Integrations");
  add(["campan", "promo", "descuento"], "PULSE · Campana", "L3. Preparo recuperacion de carritos 10%/48h. No publico hasta que confirmes la Pulse Card.", "campaigns", "Crear campana", true);
  add(["hero", "homepage", "redisen", "canvas", "titulo"], "PULSE Design", "El hero actual no cierra en 3 segundos. Abajo te dejo el reemplazo: aplicarlo es L1, reversible.", "website-builder", "Aplicar hero");
  add(["theme", "noir", "color", "preset"], "PULSE Design", "Nimbus es calma (luz, aire). Noir es filo (contraste, menos gris). Mezclar los dos hace que la tienda no tenga carácter. Yo iría Noir en este canvas y dejaría Nimbus para otra marca. El cambio es L1 y se revierte.", "website-builder", "Seguir en el canvas");
  add(["conver", "cta", "boton"], "PULSE Design", "Hay bloques que informan y no piden. El visitante no adivina el siguiente paso. Unificar a «Comprar ahora» / «Entrar» en hero, destacados y cierre. Es un cambio chico y se nota en mobile.", "website-builder", "Seguir en el canvas");

  packs.sort(function (a, b) { return b.score - a.score; });
  function injectDraft(p: Pack) {
    const d = p as Pack & { draft?: { kind: string; title: string; body: string; cta: string } };
    if (d.draft) return p;
    if (q.indexOf("theme") !== -1 || q.indexOf("noir") !== -1) {
      d.draft = { kind: "theme", title: "Noir", body: "Contraste alto, menos gris. L1, reversible.", cta: "Aplicar Noir" };
    } else if (q.indexOf("cta") !== -1 || q.indexOf("conver") !== -1 || q.indexOf("boton") !== -1) {
      d.draft = { kind: "cta", title: "CTA único", body: "Todos los botones de esta página dicen Comprar ahora.", cta: "Comprar ahora" };
    } else if (inStudio && (q.indexOf("hero") !== -1 || q.indexOf("hola") !== -1 || q.indexOf("brief") !== -1 || q.indexOf("plan") !== -1)) {
      d.draft = { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" };
    }
    return d;
  }

  let pick: Pack;
  if (!packs.length) {
    if (inStudio) pick = { title: "PULSE Design", body: input.heroTitle ? ("Hero «" + input.heroTitle + "». ¿Lo reescribimos o cambiamos theme?") : "¿Hero, theme o CTA?", action: "website-builder", label: "Seguir en el canvas", score: 0 };
    else pick = { title: "PULSE", body: "No enganché un frente claro. ¿Lo vemos por ventas, por el 1047, o por el hero del canvas?", action: input.section || "dashboard", label: "Seguir acá", score: 0 };
  } else {
    pick = packs[0];
  }
  return finish(input, injectDraft(pick) as any);
}

export function explain(input: PulseInput): PulseDecision {
  const q = expand(input.q || "ventas y stock");
  return finish(input, { title: "PULSE · Debug", body: "Query «" + q + "». Core 4.0 enruta intent → riesgo → agente. El matcher local manda; Llama es secundaria.", action: "dashboard", label: "Seguir aca" });
}
