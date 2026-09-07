#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

src = Path("src")
if not src.is_dir():
    raise SystemExit("cd /data/data/com.termux/files/home/digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
for name in (
    "DigitalBoostPulseConst.ts",
    "DigitalBoostPulseCard.ts",
    "DigitalBoostPulseCycle.ts",
    "DigitalBoostPulseKB.ts",
    "DigitalBoostPulseBrain.ts",
    "DigitalBoostPulseLog.ts",
    "DigitalBoostOperator.tsx",
):
    p = src / name
    if p.is_file():
        shutil.copy2(p, p.with_name(p.stem + ".before_visual_rebuild_" + stamp + p.suffix))

(src / "DigitalBoostPulseConst.ts").write_text(r"""
export const PULSE_CONST = `PULSE AGENTIC CORE 4.0 — DigitalBoost Commerce OS
Orquestador. No chatbot. READ libre. WRITE con riesgo y permiso.
Nunca inventes precios, stock, margenes, pedidos, proveedores ni resultados de tools.
Nunca te autoapruebes ni eleves limites.
Ciclo: actor → tenant → intent → contexto → riesgo → agente → permiso → plan → aprobar si hace falta → tool → verificar → auditar → responder.
L0 read auto. L1 reversible auto. L2 write controlado o aprobar. L3 humano. L4 nunca auto.
Proactividad: detectar → analizar → recomendar → aprobar si hace falta → actuar → medir.
Dato / calculo / estimacion / recomendacion / hipotesis: distinguilos.
A2A no es MCP. Un agente externo no escribe.
Gobernanza centralizada en PULSE.`;

export type PulseRisk = "L0" | "L1" | "L2" | "L3" | "L4";
export type PulseAgent = "sales" | "ops" | "sourcing" | "marketing" | "cx" | "a2a" | "design" | "pulse";
export type PulseActor = "merchant" | "staff" | "customer" | "system" | "external_agent";
export type PulseIntent =
  | "information" | "search" | "recommendation" | "analysis" | "optimization"
  | "content" | "catalog" | "inventory" | "pricing" | "order" | "refund"
  | "marketing" | "supplier" | "system" | "support";
export type PulseConfidence = "HIGH" | "MEDIUM" | "LOW";
export type PulseKind = "FACT" | "CALCULATION" | "ESTIMATE" | "RECOMMENDATION" | "HYPOTHESIS";

export function classifyIntent(q: string, section: string): PulseIntent {
  const s = (q + " " + section).toLowerCase();
  if (s.indexOf("reembolso") !== -1 || s.indexOf("refund") !== -1) return "refund";
  if (s.indexOf("precio") !== -1 || s.indexOf("pricing") !== -1) return "pricing";
  if (s.indexOf("campan") !== -1 || s.indexOf("promo") !== -1 || s.indexOf("seo") !== -1) return "marketing";
  if (s.indexOf("provee") !== -1 || s.indexOf("reponer") !== -1 || s.indexOf("compra") !== -1) return "supplier";
  if (s.indexOf("stock") !== -1 || s.indexOf("invent") !== -1) return "inventory";
  if (s.indexOf("pedido") !== -1 || s.indexOf("1048") !== -1 || s.indexOf("envio") !== -1) return "order";
  if (s.indexOf("hero") !== -1 || s.indexOf("copy") !== -1 || s.indexOf("theme") !== -1) return "content";
  if (s.indexOf("cliente") !== -1 || s.indexOf("vip") !== -1) return "support";
  if (s.indexOf("venta") !== -1 || s.indexOf("analytics") !== -1 || s.indexOf("brief") !== -1) return "analysis";
  if (s.indexOf("health") !== -1 || s.indexOf("alerta") !== -1) return "optimization";
  if (s.indexOf("buscar") !== -1 || s.indexOf("search") !== -1) return "search";
  if (s.indexOf("producto") !== -1) return "catalog";
  return "information";
}

export function isWriteIntent(intent: PulseIntent) {
  return intent === "pricing" || intent === "refund" || intent === "marketing" || intent === "supplier" || intent === "inventory";
}

export function classifyRisk(intent: PulseIntent, action: string): PulseRisk {
  if (action === "__integrations" || intent === "system") return "L4";
  if (intent === "refund" || intent === "supplier" || action === "campaigns") return "L3";
  if (intent === "pricing" || intent === "inventory") return "L2";
  if (intent === "content" || intent === "marketing" || action === "__automations" || action === "website-builder") return "L1";
  return "L0";
}

export function pickAgent(intent: PulseIntent, section: string): PulseAgent {
  if (section === "website-builder" || section === "store-builder" || intent === "content") return "design";
  if (intent === "supplier" || intent === "inventory") return "sourcing";
  if (intent === "marketing") return "marketing";
  if (intent === "support") return "cx";
  if (intent === "catalog" || intent === "recommendation") return "sales";
  if (intent === "analysis" || intent === "order" || intent === "optimization") return "ops";
  return "pulse";
}

export function confidenceOf(hasRange: boolean, hasCanvas: boolean): PulseConfidence {
  if (hasRange && hasCanvas) return "HIGH";
  if (hasRange || hasCanvas) return "MEDIUM";
  return "LOW";
}
""", encoding="utf-8")
print("ok const 4.0")

(src / "DigitalBoostPulseCard.ts").write_text(r"""
import type { PulseRisk } from "./DigitalBoostPulseConst";

export type PulseCard = {
  type: "PULSE_CARD_APPROVAL";
  version: "1.0";
  approval_id: string;
  risk_level: PulseRisk;
  title: string;
  description: string;
  reason: string;
  scope: { products_affected: number; orders_affected: number; customers_affected: number };
  estimated_impact: { note: string; currency: string };
  tool: { name: string; parameters: Record<string, unknown> };
  policy_check: { passed: boolean; limit: string };
  buttons: { label: string; action: "APPROVE" | "REJECT" }[];
};

export function approvalCard(opts: {
  risk: PulseRisk;
  name: string;
  description: string;
  reason: string;
  tool: string;
}): PulseCard {
  const id = "appr_" + Date.now().toString(36);
  return {
    type: "PULSE_CARD_APPROVAL",
    version: "1.0",
    approval_id: id,
    risk_level: opts.risk,
    title: "Aprobacion requerida · " + opts.risk,
    description: opts.description,
    reason: opts.reason,
    scope: { products_affected: 0, orders_affected: 0, customers_affected: 0 },
    estimated_impact: { note: "Estimacion. No es un hecho auditado.", currency: "USD" },
    tool: { name: opts.tool, parameters: {} },
    policy_check: { passed: true, limit: "Merchant policy · DigitalBoost OS" },
    buttons: [
      { label: "Confirmar y aplicar", action: "APPROVE" },
      { label: "Rechazar", action: "REJECT" }
    ]
  };
}
""", encoding="utf-8")
print("ok card")

(src / "DigitalBoostPulseLog.ts").write_text(r"""
const KEY = "db-pulse-lora-v1";
const AUDIT = "db-pulse-audit-v1";

export type PulseExample = {
  q: string;
  section: string;
  store: string;
  range: string;
  live: boolean;
  title: string;
  body: string;
  action: string;
  confirm: boolean;
  t: number;
};

export type PulseAudit = {
  timestamp: string;
  tenant_id: string;
  store_id: string;
  actor_type: string;
  request_id: string;
  intent: string;
  agent: string;
  risk_level: string;
  tool: string;
  approval_required: boolean;
  status: string;
  result_summary: string;
};

function readArr(k: string) {
  try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; }
}
function writeArr(k: string, rows: unknown[]) {
  try { localStorage.setItem(k, JSON.stringify(rows.slice(-800))); } catch {}
}

export function pushExample(row: Omit<PulseExample, "t">) {
  const rows = readArr(KEY) as PulseExample[];
  rows.push(Object.assign({ t: Date.now() }, row));
  writeArr(KEY, rows);
}
export function countExamples() { return (readArr(KEY) as unknown[]).length; }
export function dumpJSONL() {
  const system = "Sos PULSE 4.0, orquestador de DigitalBoost. JSON only: title, body, action, actionLabel, confirm, risk.";
  return (readArr(KEY) as PulseExample[]).map(function (r) {
    return JSON.stringify({
      instruction: system,
      input: "tienda=" + r.store + " rango=" + r.range + " seccion=" + r.section + "\npregunta: " + r.q,
      output: JSON.stringify({ title: r.title, body: r.body, action: r.action, confirm: r.confirm })
    });
  }).join("\n");
}
export function pushAudit(row: PulseAudit) {
  const rows = readArr(AUDIT) as PulseAudit[];
  rows.push(row);
  writeArr(AUDIT, rows);
}
export function requestId() {
  return "req_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
}
""", encoding="utf-8")
print("ok log")

(src / "DigitalBoostPulseCycle.ts").write_text(r"""
import { classifyIntent, classifyRisk, pickAgent, isWriteIntent, type PulseIntent, type PulseRisk, type PulseAgent } from "./DigitalBoostPulseConst";
import { approvalCard, type PulseCard } from "./DigitalBoostPulseCard";
import { pushAudit, requestId } from "./DigitalBoostPulseLog";

export type CycleMeta = {
  request_id: string;
  actor: "merchant";
  tenant: string;
  intent: PulseIntent;
  agent: PulseAgent;
  risk: PulseRisk;
  write: boolean;
  confirm: boolean;
  card?: PulseCard;
};

export function runCycle(input: { q: string; section: string; store: string; action: string; title: string; body: string; alreadyConfirm: boolean }): CycleMeta {
  const intent = classifyIntent(input.q, input.section);
  const write = isWriteIntent(intent) || input.alreadyConfirm;
  const risk = classifyRisk(intent, input.action);
  const agent = pickAgent(intent, input.section);
  const confirm = write || risk === "L2" || risk === "L3" || risk === "L4" || input.alreadyConfirm;
  const rid = requestId();
  const card = confirm ? approvalCard({
    risk: risk,
    name: input.title,
    description: input.body.slice(0, 220),
    reason: "Core 4.0 · intent " + intent + " · write=" + String(write),
    tool: input.action
  }) : undefined;
  try {
    pushAudit({
      timestamp: new Date().toISOString(),
      tenant_id: "digitalboost",
      store_id: input.store,
      actor_type: "merchant",
      request_id: rid,
      intent: intent,
      agent: agent,
      risk_level: risk,
      tool: input.action,
      approval_required: confirm,
      status: confirm ? "AWAITING_APPROVAL" : "SUCCEEDED",
      result_summary: input.title
    });
  } catch {}
  return { request_id: rid, actor: "merchant", tenant: input.store, intent: intent, agent: agent, risk: risk, write: write, confirm: confirm, card: card };
}
""", encoding="utf-8")
print("ok cycle")

(src / "DigitalBoostPulseKB.ts").write_text(r"""
import { runCycle } from "./DigitalBoostPulseCycle";
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
  risk?: string;
  agent?: string;
  intent?: string;
  card?: unknown;
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

function finish(input: PulseInput, pick: { title: string; body: string; action: string; label: string; confirm?: boolean }): PulseDecision {
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
  const tag = " · " + meta.agent + " · " + meta.risk + " · " + meta.intent;
  return {
    title: pick.title,
    body: pick.body + tag + (meta.confirm ? " · Aprobacion " + meta.risk : ""),
    action: pick.action,
    actionLabel: meta.confirm ? "Revisar Pulse Card" : pick.label,
    confirm: meta.confirm,
    risk: meta.risk,
    agent: meta.agent,
    intent: meta.intent,
    card: meta.card
  };
}

export function decide(input: PulseInput): PulseDecision {
  let q = expand(input.q || "");
  const inStudio = input.section === "website-builder" || input.section === "store-builder" || input.section === "builder";
  if (q === "ok" || q === "si" || q === "mas") {
    q = lastAction === "orders" ? "pedidos" : lastAction === "products" ? "stock" : lastAction === "analytics" ? "ventas" : lastAction === "website-builder" ? "hero" : "hola";
  }
  if (q.indexOf("dataset") !== -1 || q.indexOf("jsonl") !== -1) {
    const n = countExamples();
    try { (window as any).__pulseJSONL = dumpJSONL(); } catch {}
    return finish(input, { title: "PULSE · Dataset", body: n + " ejemplos. JSONL en window.__pulseJSONL para Unsloth/Colab. Llama sigue secundaria.", action: "dashboard", label: "Seguir" });
  }
  if (q.indexOf("brief") !== -1 || q === "estado" || q === "resumen") return finish(input, skillBriefing(input));
  if (q.indexOf("plan") !== -1 || q.indexOf("prioridad") !== -1) return finish(input, skillPlan(input));
  if (q.indexOf("alerta") !== -1 || q.indexOf("urgente") !== -1) return finish(input, skillAlerta(input));
  if (q === "hero" || q.indexOf("arreglar hero") !== -1) return finish(input, skillHero());

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
  add(["venta", "plata", "ingreso", "analytics", "factur"], "PULSE · Ventas", "CALCULO sobre demo seed, no un hecho de pasarela. " + st(input) + ". " + money(salesN) + " · " + ordersN + " pedidos · ticket " + money(ticket) + ". Mobile recorta. ¿Abro Analytics?", "analytics", "Abrir Analytics");
  add(["pedido", "orden", "envio", "despacho", "1048", "1047"], "PULSE · Pedidos", "DATO demo: DB-1048 pagado, 1047 en preparacion. El cuello es despacho, no la vitrina.", "orders", "Abrir Pedidos");
  add(["stock", "invent", "sku", "producto", "cap"], "PULSE · Stock", "RECOMENDACION sobre seed: Cap Digital Blue fino. Reponer no es comprar: eso seria L3.", "products", "Abrir Productos");
  add(["cliente", "vip", "martin"], "PULSE · Clientes", "RECOMENDACION: valor concentrado. Tag VIP, no campana masiva.", "customers", "Abrir Clientes");
  add(["health", "salud", "error", "diagnost"], "PULSE · Health", "Alerta operativa. Te abro el diagnostico. No ejecuto cambios.", "__health", "Abrir Store Health");
  add(["buscar", "search"], "PULSE · Search", "Te abro Search del OS.", "__search", "Abrir Search");
  add(["automat", "flujo"], "PULSE · Flujos", "L1: preparar flujos. Activarlos puede pedir aprobacion.", "__automations", "Abrir Automations");
  add(["integr", "stripe"], "PULSE · Integrations", "L4 de gobernanza si se tocan credenciales. Solo abro el panel.", "__integrations", "Abrir Integrations");
  add(["campan", "promo", "descuento"], "PULSE · Campana", "L3. Preparo recuperacion de carritos 10%/48h. No publico hasta que confirmes la Pulse Card.", "campaigns", "Crear campana", true);
  add(["hero", "homepage", "redisen", "canvas"], "PULSE Design", "L1 contenido. Hero: 3 segundos, una promesa, un CTA. AI Design aplica al canvas.", "website-builder", "Abrir Store Builder");
  add(["theme", "noir", "color"], "PULSE Design", "Aura calma · Noir precision. Chip Theme. Reversible.", "website-builder", "Seguir en el canvas");
  add(["conver", "cta"], "PULSE Design", "Todo bloque sin CTA es ruido.", "website-builder", "Abrir Store Builder");

  packs.sort(function (a, b) { return b.score - a.score; });
  let pick: Pack;
  if (!packs.length) {
    if (inStudio) pick = { title: "PULSE Design", body: input.heroTitle ? ("Hero «" + input.heroTitle + "». ¿Lo reescribimos o cambiamos theme?") : "¿Hero, theme o CTA?", action: "website-builder", label: "Seguir en el canvas", score: 0 };
    else pick = { title: "PULSE", body: "¿Cifras, un pedido, o el canvas? No asumo la intencion.", action: input.section || "dashboard", label: "Seguir aca", score: 0 };
  } else {
    pick = packs[0];
  }
  return finish(input, pick);
}

export function explain(input: PulseInput): PulseDecision {
  const q = expand(input.q || "ventas y stock");
  return finish(input, { title: "PULSE · Debug", body: "Query «" + q + "». Core 4.0 enruta intent → riesgo → agente. El matcher local manda; Llama es secundaria.", action: "dashboard", label: "Seguir aca" });
}
""", encoding="utf-8")
print("ok KB")

# Skills file may miss labels used by finish() — keep compatible
sk = src / "DigitalBoostPulseSkills.ts"
if not sk.is_file() or "actionLabel" not in sk.read_text(encoding="utf-8"):
    sk.write_text(r"""
import type { PulseInput } from "./DigitalBoostPulseKB";
function mul(r: string) { return r === "90d" ? 12 : r === "30d" ? 4 : 1; }
function money(n: number) { return "US$ " + n.toLocaleString("es-AR"); }
export function skillBriefing(i: PulseInput) {
  const m = mul(i.range);
  return {
    title: "PULSE · Briefing",
    body: i.store + " " + i.range + (i.live ? " live" : " atencion") + ". CALCULO seed: " + money(Math.round(474 * m)) + " · " + Math.max(1, Math.round(4 * m)) + " pedidos. Rojos: cap fino, 1047 trabado, mobile. Siguiente: despacho → reposicion → CTA hero.",
    action: "dashboard",
    label: "Seguir en Overview"
  };
}
export function skillPlan(i: PulseInput) {
  return {
    title: "PULSE · Plan",
    body: "1) Despachar DB-1047. 2) Reponer Cap. 3) Hero con un CTA. 4) Campana carritos = L3, Pulse Card. Orden para " + i.store + ".",
    action: "orders",
    label: "Empezar por Pedidos"
  };
}
export function skillAlerta(_i: PulseInput) {
  return {
    title: "PULSE · Alerta",
    body: "Stock cap + pedido trabado + conversion mobile. Te abro Health. No escribo inventario.",
    action: "__health",
    label: "Abrir Store Health"
  };
}
export function skillHero() {
  try { localStorage.setItem("db-pulse-skill", "hero"); } catch {}
  return {
    title: "PULSE Design · Hero",
    body: "L1 contenido. Marque skill hero. AI Design aplica copy reversible.",
    action: "website-builder",
    label: "Abrir Store Builder"
  };
}
""", encoding="utf-8")
    print("ok skills")
else:
    print("skills kept")

(src / "DigitalBoostPulseBrain.ts").write_text(r"""
import { decide, explain, type PulseInput, type PulseDecision } from "./DigitalBoostPulseKB";
export type { PulseInput, PulseDecision };
export type PulseBlock = { id: string; type: string; title: string; body: string; cta: string };
export { explain };
export function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
export function analyze(input: PulseInput): PulseDecision {
  return decide(input);
}
export async function analyzeSmart(input: PulseInput) {
  return { decision: decide(input), engine: "rules" as const };
}
export function designApply(q: string, blocks: PulseBlock[]) {
  const s = (q || "").toLowerCase();
  const next = blocks.map(function (b) { return Object.assign({}, b); });
  if (s.indexOf("hero") !== -1 || s.indexOf("premium") !== -1 || s.indexOf("redisen") !== -1) {
    next.forEach(function (b) {
      if (b.type === "hero") { b.title = "La coleccion que no pide permiso."; b.body = "Menos texto. Un CTA."; b.cta = "Entrar"; }
    });
    return { note: "L1 Design: hero tocado. Reversible con History.", next: next };
  }
  return { note: "Proba hero / premium.", next: blocks };
}
""", encoding="utf-8")
print("ok brain")

(src / "DigitalBoostOperator.tsx").write_text(r"""
import { useEffect, useState } from "react";
import { analyze, explain, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";

function readCanvas() {
  let page = "Inicio";
  let n = 0;
  let hero = "";
  try {
    page = localStorage.getItem("db-store-page-v1") || "Inicio";
    const raw = localStorage.getItem("db-store-canvas-v1:" + page) || localStorage.getItem("db-store-canvas-v1") || "[]";
    const blocks = JSON.parse(raw);
    if (Array.isArray(blocks)) {
      n = blocks.length;
      const h = blocks.find(function (b: any) { return b && b.type === "hero"; });
      if (h) hero = String(h.title || "");
    }
  } catch {}
  return { page: page, n: n, hero: hero };
}
function ctx() {
  let range = "7d", store = "Aura", live = true;
  try {
    range = localStorage.getItem("db-os-range-v1") || "7d";
    store = localStorage.getItem("db-active-store-v1") || "Aura";
    live = localStorage.getItem("db-os-live-v1") !== "0";
  } catch {}
  return { range: range, store: store, live: live };
}

export default function DigitalBoostOperator(props: {
  onClose: () => void;
  onNavigate: (id: any) => void;
  section?: string;
  onOpenHealth?: () => void;
  onOpenAutomations?: () => void;
  onOpenConsole?: () => void;
  onOpenIntegrations?: () => void;
  onOpenSearch?: () => void;
}) {
  const section = props.section || "dashboard";
  const builder = isBuilder(section);
  const CHIPS = builder ? ["briefing", "hero", "plan"] : ["briefing", "plan", "alerta", "ventas", "pedidos"];
  const [q, setQ] = useState("hola");
  const [out, setOut] = useState<PulseDecision | null>(null);
  const [msgs, setMsgs] = useState<{ role: string; text: string }[]>([]);
  function follows(action: string) {
    if (builder || action === "website-builder") return [["hero", "¿Reescribimos el hero?"], ["theme", "¿Probamos Noir?"], ["conversion", "¿Dónde falta el CTA?"]];
    if (action === "orders") return [["plan", "¿Cerramos el 1047?"], ["stock", "¿Reponemos el cap?"], ["alerta", "¿Qué más está rojo?"]];
    if (action === "analytics") return [["briefing", "¿Cómo está el día?"], ["pedidos", "¿Y los envíos?"], ["plan", "Armame el orden"]];
    if (action === "campaigns") return [["briefing", "Volver al pulso"], ["plan", "Otra prioridad"]];
    return [["briefing", "¿Cómo está el día?"], ["plan", "¿Por dónde empiezo?"], ["alerta", "¿Qué está en rojo?"]];
  }
  function think(word: string) {
    const c = ctx();
    const cv = readCanvas();
    const payload = { q: word || "hola", section: section, store: c.store, range: c.range, live: c.live, page: cv.page, blockCount: cv.n, heroTitle: cv.hero };
    const r = (word === "debug") ? explain(payload) : analyze(payload);
    setOut(r);
    setMsgs(function (m) {
      return m.concat([{ role: "user", text: word || "hola" }, { role: "pulse", text: r.body }]);
    });
  }
  useEffect(function () {
    try {
      const seed = localStorage.getItem("db-pulse-seed");
      if (seed) {
        localStorage.removeItem("db-pulse-seed");
        think(seed);
      }
    } catch {}
  }, []);
  function exec() {
    if (!out) return;
    props.onClose();
    if (out.action === "__health" && props.onOpenHealth) props.onOpenHealth();
    else if (out.action === "__search" && props.onOpenSearch) props.onOpenSearch();
    else if (out.action === "__automations" && props.onOpenAutomations) props.onOpenAutomations();
    else if (out.action === "__console" && props.onOpenConsole) props.onOpenConsole();
    else if (out.action === "__integrations" && props.onOpenIntegrations) props.onOpenIntegrations();
    else props.onNavigate(out.action);
  }
  const canvas = readCanvas();
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">PULSE · Core 4.0</div>
            <div className="text-sm font-semibold">{builder ? "Design" : "OS"} · {canvas.page} · {canvas.n} bloques</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-3 p-4">
          <textarea className="min-h-16 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm outline-none" value={q} onChange={function (e) { setQ(e.target.value); }} placeholder="briefing, 1048, campaña, hero…" />
          <div className="flex flex-wrap gap-1">
            {CHIPS.map(function (c) {
              return <button key={c} type="button" onClick={function () { setQ(c); think(c); }} className="h-9 rounded-full border border-white/10 px-3 text-[11px] text-cyan-300">{c}</button>;
            })}
          </div>
          <button type="button" onClick={function () { think(q || "hola"); }} className="h-11 w-full rounded-lg bg-cyan-400 text-sm font-semibold text-[#070D18]">Hablar con PULSE</button>
          {msgs.length > 0 && (
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {msgs.map(function (m, i) {
                return (
                  <div key={i} className={m.role === "user" ? "rounded-lg bg-white/5 px-3 py-2 text-xs" : "rounded-lg border border-cyan-400/25 bg-cyan-400/5 px-3 py-2 text-xs text-[#AFC0D5]"}>
                    <span className="font-semibold text-cyan-300">{m.role === "user" ? "Vos" : "PULSE"} · </span>{m.text}
                  </div>
                );
              })}
            </div>
          )}
          {out && out.card ? (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs leading-5">
              <div className="font-semibold text-amber-200">Pulse Card · {out.risk} · {out.agent}</div>
              <p className="mt-1 text-[#AFC0D5]">{out.body}</p>
              <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-amber-200">QUE → POR QUE → RIESGO → CONFIRMAR</div>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={exec} className="h-11 flex-1 rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Confirmar</button>
                <button type="button" onClick={function () { setOut(null); }} className="h-11 flex-1 rounded-lg border border-white/10 text-xs">Rechazar</button>
              </div>
            </div>
          ) : null}
          {out && !out.card && follows(out.action).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {follows(out.action).map(function (pair) {
                return (
                  <button key={pair[0]} type="button" onClick={function () { setQ(pair[0]); think(pair[0]); }} className="rounded-full border border-cyan-400/35 px-3 py-2 text-left text-[11px] leading-4 text-cyan-200">
                    {pair[1]}
                  </button>
                );
              })}
            </div>
          )}
          {out && !out.card && (
            <button type="button" onClick={exec} className="h-11 w-full rounded-lg border border-cyan-400/40 text-xs text-cyan-300">{out.actionLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok operator")
print("LISTO PULSE 4.0")
print("briefing / campana (Pulse Card) / hero en el studio")
