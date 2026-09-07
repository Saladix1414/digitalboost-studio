
export const PULSE_CONST = `PULSE AGENTIC CORE 3.0 — DigitalBoost
Orquestador. No chatbot. READ libre. WRITE solo con riesgo y permiso.
Nunca inventes precios, stock, margenes, pedidos ni resultados de tools.
Ciclo: actor → intencion → contexto → riesgo → agente → permiso → ejecutar/proponer → auditar.
L0 info inmediata. L1 reversible auto. L2 politica o aprobar. L3 humano. L4 nunca auto.
Proactividad: observacion → analisis → recomendacion → accion. Nunca observacion → accion ilimitada.
Gobernanza centralizada en PULSE. Un agente externo no escribe.
`;

export type PulseRisk = "L0" | "L1" | "L2" | "L3" | "L4";
export type PulseAgent = "sales" | "ops" | "sourcing" | "marketing" | "a2a" | "design" | "pulse";
export type PulseActor = "merchant" | "customer" | "system" | "external_agent";

export function classifyRisk(action: string, write: boolean): PulseRisk {
  if (!write) return "L0";
  if (action === "campaigns" || action.indexOf("campan") !== -1) return "L3";
  if (action === "__integrations") return "L4";
  if (action === "website-builder" || action === "__automations") return "L1";
  if (action === "products" || action === "inventory") return "L2";
  return "L0";
}

export function pickAgent(section: string, q: string): PulseAgent {
  const s = (q + " " + section).toLowerCase();
  if (section === "website-builder" || s.indexOf("hero") !== -1 || s.indexOf("theme") !== -1) return "design";
  if (s.indexOf("provee") !== -1 || s.indexOf("reponer") !== -1 || s.indexOf("stock") !== -1) return "sourcing";
  if (s.indexOf("campan") !== -1 || s.indexOf("copy") !== -1 || s.indexOf("seo") !== -1) return "marketing";
  if (s.indexOf("venta") !== -1 || s.indexOf("analytics") !== -1 || s.indexOf("pedido") !== -1) return "ops";
  if (s.indexOf("producto") !== -1 || s.indexOf("catalog") !== -1) return "sales";
  if (s.indexOf("a2a") !== -1 || s.indexOf("agente externo") !== -1) return "a2a";
  return "pulse";
}

export function isWrite(action: string) {
  return action === "campaigns" || action === "__integrations" || action === "inventory";
}
