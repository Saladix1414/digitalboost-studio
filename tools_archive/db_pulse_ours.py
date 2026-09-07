#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

src = Path("src")
if not (src / "DigitalBoostPulseBrain.ts").is_file():
    raise SystemExit("Falta brain — cd al studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(src / "DigitalBoostPulseBrain.ts", src / ("DigitalBoostPulseBrain.before_visual_rebuild_" + stamp + ".ts"))

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

function stamp(i: PulseInput) {
  return i.store + " · " + i.range + " · " + (i.live ? "Live" : "Attention");
}
function facts(i: PulseInput) {
  const mul = i.range === "90d" ? 12 : i.range === "30d" ? 4 : 1;
  const sales = Math.round(474 * mul);
  return { sales: sales, orders: Math.max(1, Math.round(4 * mul)), ticket: Math.round(118 * mul), sku: "Cap Digital Blue", order: "DB-1048" };
}

type Rule = { keys: string[]; title: string; body: (i: PulseInput) => string; action: string; label: string; confirm?: boolean };

const RULES: Rule[] = [
  { keys: ["hola", "quien", "sos", "pulse"], title: "PULSE", body: function (i) { return stamp(i) + ". Inteligencia de DigitalBoost, no un chat generico. Opero este comercio: cifras, pedidos, stock y el canvas."; }, action: "dashboard", label: "Seguir en Overview" },
  { keys: ["venta", "plata", "ingreso", "analytics", "30d", "7d"], title: "PULSE · Ventas", body: function (i) { const f = facts(i); return stamp(i) + ". Ventas \~ US$ " + f.sales.toLocaleString("es-AR") + ", ticket US$ " + f.ticket + ". El recorte esta en mobile, no en precio."; }, action: "analytics", label: "Abrir Analytics" },
  { keys: ["pedido", "orden", "1048", "envio"], title: "PULSE · Pedidos", body: function (i) { return stamp(i) + ". " + facts(i).order + " pagado. El cuello es despacho (1047 en preparacion), no la vitrina."; }, action: "orders", label: "Abrir Pedidos" },
  { keys: ["stock", "invent", "sku", "producto", "cap"], title: "PULSE · Stock", body: function (i) { return stamp(i) + ". " + facts(i).sku + " esta fino. Reponer antes del drop o el OS vende vacio."; }, action: "products", label: "Abrir Productos" },
  { keys: ["cliente", "vip", "martin"], title: "PULSE · Clientes", body: function () { return "Valor concentrado en pocos perfiles. Tag VIP y follow-up, no otra campana masiva."; }, action: "customers", label: "Abrir Clientes" },
  { keys: ["health", "salud", "error", "diagnost"], title: "PULSE · Health", body: function () { return "Checkout y stock piden ojo. Te abro el diagnostico del OS."; }, action: "__health", label: "Abrir Store Health" },
  { keys: ["buscar", "search"], title: "PULSE · Search", body: function () { return "Te abro Search del OS: pedidos, productos, comandos."; }, action: "__search", label: "Abrir Search" },
  { keys: ["automat", "flujo"], title: "PULSE · Automations", body: function () { return "Trigger, condicion, accion. Te abro flujos."; }, action: "__automations", label: "Abrir Automations" },
  { keys: ["integr", "stripe"], title: "PULSE · Integrations", body: function () { return "Connect / Disconnect del marketplace."; }, action: "__integrations", label: "Abrir Integrations" },
  { keys: ["console", "log"], title: "PULSE · Console", body: function () { return "Cada accion queda en Operations Console."; }, action: "__console", label: "Abrir Console" },
  { keys: ["campan", "promo", "descuento"], title: "PULSE · Campana", body: function () { return "Recuperacion de carritos 10% / 48h. Confirma y te llevo a Marketing."; }, action: "campaigns", label: "Crear campana", confirm: true },
  { keys: ["hero", "homepage", "canvas", "redisen", "tienda", "conver"], title: "PULSE Design", body: function () { return "El hero tiene 3 segundos. El grid sin CTA es ruido. Te mando al estudio; AI Design aplica el copy."; }, action: "website-builder", label: "Abrir Store Builder" },
  { keys: ["theme", "noir", "color"], title: "PULSE Design · Theme", body: function () { return "Aura calma, Noir precisio. Chip Theme en el studio."; }, action: "website-builder", label: "Seguir en el canvas" },
  { keys: ["live", "attention"], title: "PULSE · Status", body: function (i) { return stamp(i) + ". Live/Attention se cambia en el header."; }, action: "dashboard", label: "Overview" }
];

export function decide(input: PulseInput): PulseDecision {
  const q = (input.q || "").toLowerCase();
  let best: Rule | null = null;
  let score = 0;
  for (let r = 0; r < RULES.length; r++) {
    let s = 0;
    for (let k = 0; k < RULES[r].keys.length; k++) {
      if (q.indexOf(RULES[r].keys[k]) !== -1) s += 1;
    }
    if (s > score) { score = s; best = RULES[r]; }
  }
  if (!best || score === 0) {
    best = RULES[0];
  }
  return {
    title: best.title,
    body: best.body(input),
    action: best.action,
    actionLabel: best.label,
    confirm: Boolean(best.confirm)
  };
}
""", encoding="utf-8")
print("ok KB")

(src / "DigitalBoostPulseBrain.ts").write_text(r"""
import { decide, type PulseInput, type PulseDecision } from "./DigitalBoostPulseKB";

export type { PulseInput, PulseDecision };
export type PulseBlock = { id: string; type: string; title: string; body: string; cta: string };

export function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
export function stampOf(input: PulseInput) {
  return input.store + " · " + input.range + " · " + (input.live ? "Live" : "Attention");
}
export function analyze(input: PulseInput): PulseDecision {
  return decide(input);
}
export async function analyzeSmart(input: PulseInput): Promise<{ decision: PulseDecision; engine: "ollama" | "rules" }> {
  return { decision: decide(input), engine: "rules" };
}
export function designApply(q: string, blocks: PulseBlock[]): { note: string; next: PulseBlock[] } {
  const s = (q || "").toLowerCase();
  const next = blocks.map(function (b) { return Object.assign({}, b); });
  if (s.indexOf("premium") !== -1 || s.indexOf("hero") !== -1 || s.indexOf("redisen") !== -1) {
    next.forEach(function (b) {
      if (b.type === "hero") { b.title = "La coleccion que no pide permiso."; b.body = "Menos texto. Un CTA."; b.cta = "Entrar"; }
    });
    return { note: "PULSE Design toco el hero.", next: next };
  }
  return { note: "Proba: hero / premium / conversion.", next: blocks };
}
""", encoding="utf-8")
print("ok brain instant")
print("LISTO PULSE OURS")
print("Cero fetch. Cero claves. Respuesta al toque.")
