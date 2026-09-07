#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
(src / "DigitalBoostPulseKB.ts").write_text(r"""
export type PulseInput = {
  q: string;
  section: string;
  store: string;
  range: string;
  live: boolean;
};
export type PulseDecision = {
  title: string;
  body: string;
  action: string;
  actionLabel: string;
  confirm: boolean;
};

function st(i: PulseInput) {
  return i.store + " · " + i.range + (i.live ? " · live" : " · atención");
}
function mul(i: PulseInput) {
  return i.range === "90d" ? 12 : i.range === "30d" ? 4 : 1;
}
function sales(i: PulseInput) {
  return Math.round(474 * mul(i)).toLocaleString("es-AR");
}

export function decide(input: PulseInput): PulseDecision {
  const q = (input.q || "").toLowerCase().trim();
  const builder = input.section === "website-builder" || input.section === "store-builder";

  if (!q || q === "hola" || q.indexOf("quien") !== -1 || q.indexOf("sos") !== -1) {
    if (builder)
      return { title: "PULSE Design", body: "Estudio listo. Decime hero, theme o conversion y te digo qué tocar. El chip AI Design lo aplica.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    return { title: "PULSE", body: st(input) + ". ¿Qué frente? Ventas, pedidos, stock o health. Una cosa a la vez.", action: "dashboard", actionLabel: "Seguir acá", confirm: false };
  }
  if (q.indexOf("gracias") !== -1)
    return { title: "PULSE", body: "Cuando quieras. Health o el canvas, lo que pique.", action: input.section, actionLabel: "Seguir", confirm: false };
  if (q.indexOf("venta") !== -1 || q.indexOf("plata") !== -1 || q.indexOf("analytics") !== -1)
    return { title: "PULSE · Ventas", body: st(input) + ". US$ " + sales(input) + " en este tramo. Ticket firme, mobile recorta. Te abro Analytics si querés el desglose.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (q.indexOf("pedido") !== -1 || q.indexOf("1048") !== -1 || q.indexOf("envio") !== -1)
    return { title: "PULSE · Pedidos", body: "DB-1048 pagado. 1047 sigue en preparación: el cuello es despacho, no la vitrina.", action: "orders", actionLabel: "Abrir Pedidos", confirm: false };
  if (q.indexOf("stock") !== -1 || q.indexOf("producto") !== -1 || q.indexOf("cap") !== -1)
    return { title: "PULSE · Stock", body: "Cap Digital Blue está fino. Si el drop llega sin reposición, vendés vacío.", action: "products", actionLabel: "Abrir Productos", confirm: false };
  if (q.indexOf("cliente") !== -1 || q.indexOf("vip") !== -1)
    return { title: "PULSE · Clientes", body: "El valor está en pocos perfiles. Tag VIP y follow-up. No otra campaña masiva.", action: "customers", actionLabel: "Abrir Clientes", confirm: false };
  if (q.indexOf("health") !== -1 || q.indexOf("error") !== -1)
    return { title: "PULSE · Health", body: "Hay ruido en checkout y stock. Te abro el diagnóstico.", action: "__health", actionLabel: "Abrir Store Health", confirm: false };
  if (q.indexOf("buscar") !== -1 || q.indexOf("search") !== -1)
    return { title: "PULSE · Search", body: "Pedidos, productos, comandos. Te abro Search.", action: "__search", actionLabel: "Abrir Search", confirm: false };
  if (q.indexOf("automat") !== -1)
    return { title: "PULSE · Flujos", body: "Trigger → condición → acción. Te abro Automations.", action: "__automations", actionLabel: "Abrir Automations", confirm: false };
  if (q.indexOf("campan") !== -1 || q.indexOf("promo") !== -1)
    return { title: "PULSE · Campaña", body: "Primero: carritos abandonados, 10% / 48h. Confirmá y te llevo a Marketing.", action: "campaigns", actionLabel: "Crear campaña", confirm: true };
  if (q.indexOf("hero") !== -1 || q.indexOf("redisen") !== -1 || q.indexOf("homepage") !== -1)
    return { title: "PULSE Design", body: "El hero tiene 3 segundos. Una promesa, un CTA. AI Design lo escribe en el canvas.", action: "website-builder", actionLabel: "Abrir Store Builder", confirm: false };
  if (q.indexOf("theme") !== -1 || q.indexOf("noir") !== -1)
    return { title: "PULSE Design", body: "Aura = calma. Noir = precisión. Chip Theme en el studio.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
  if (q.indexOf("conver") !== -1 || q.indexOf("cta") !== -1)
    return { title: "PULSE Design", body: "Todo bloque sin CTA es ruido. Hero, productos, cierre.", action: "website-builder", actionLabel: "Abrir Store Builder", confirm: false };

  return {
    title: "PULSE",
    body: "No enganché un frente claro. Proba: ventas, pedidos, stock, health, hero o campaña.",
    action: input.section || "dashboard",
    actionLabel: "Seguir acá",
    confirm: false
  };
}
""", encoding="utf-8")
print("ok KB voz")

brain = src / "DigitalBoostPulseBrain.ts"
bt = brain.read_text(encoding="utf-8") if brain.is_file() else ""
if "from \"./DigitalBoostPulseKB\"" not in bt:
    brain.write_text(r"""
import { decide, type PulseInput, type PulseDecision } from "./DigitalBoostPulseKB";
export type { PulseInput, PulseDecision };
export type PulseBlock = { id: string; type: string; title: string; body: string; cta: string };
export function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
export function analyze(input: PulseInput): PulseDecision { return decide(input); }
export async function analyzeSmart(input: PulseInput) { return { decision: decide(input), engine: "rules" as const }; }
export function designApply(q: string, blocks: PulseBlock[]) {
  const s = (q || "").toLowerCase();
  const next = blocks.map(function (b) { return Object.assign({}, b); });
  if (s.indexOf("hero") !== -1 || s.indexOf("premium") !== -1) {
    next.forEach(function (b) {
      if (b.type === "hero") { b.title = "La coleccion que no pide permiso."; b.body = "Menos texto. Un CTA."; b.cta = "Entrar"; }
    });
    return { note: "Hero tocado.", next: next };
  }
  return { note: "Proba hero / premium.", next: blocks };
}
""", encoding="utf-8")
    print("ok brain hook")
print("LISTO VOZ")
