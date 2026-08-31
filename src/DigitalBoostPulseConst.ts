
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
  if (s.indexOf("health") !== -1 || s.indexOf("alerta") !== -1 || s.indexOf("plan") !== -1 || s.indexOf("brief") !== -1) return "optimization";
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
