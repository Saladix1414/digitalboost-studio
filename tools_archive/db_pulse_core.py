#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
for name in ("DigitalBoostPulseConst.ts", "DigitalBoostPulseKB.ts", "DigitalBoostOperator.tsx"):
    p = src / name
    if p.is_file():
        shutil.copy2(p, p.with_name(p.stem + ".before_visual_rebuild_" + stamp + p.suffix))

(src / "DigitalBoostPulseConst.ts").write_text(r"""
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
""", encoding="utf-8")
print("ok const 3.0")

(src / "DigitalBoostPulseCard.ts").write_text(r"""
import type { PulseRisk } from "./DigitalBoostPulseConst";
export type PulseCard = {
  type: "PULSE_CARD_APPROVAL";
  version: "1.0";
  risk_level: PulseRisk;
  title: string;
  action: { name: string; summary: string };
  reason: string;
  estimated_impact: { note: string };
  tool: { name: string; parameters: Record<string, unknown> };
  buttons: { label: string; action: "APPROVE" | "REJECT" }[];
};
export function approvalCard(opts: { risk: PulseRisk; name: string; summary: string; reason: string; tool: string }): PulseCard {
  return {
    type: "PULSE_CARD_APPROVAL",
    version: "1.0",
    risk_level: opts.risk,
    title: "Aprobacion requerida · " + opts.risk,
    action: { name: opts.name, summary: opts.summary },
    reason: opts.reason,
    estimated_impact: { note: "Estimacion. No es un hecho auditado." },
    tool: { name: opts.tool, parameters: {} },
    buttons: [
      { label: "Confirmar y aplicar", action: "APPROVE" },
      { label: "Rechazar", action: "REJECT" }
    ]
  };
}
""", encoding="utf-8")
print("ok card")

# Patch KB: wrap decide with risk + confirm for writes
kb = src / "DigitalBoostPulseKB.ts"
if kb.is_file():
    t = kb.read_text(encoding="utf-8")
    if "classifyRisk" not in t:
        t = 'import { classifyRisk, isWrite, pickAgent } from "./DigitalBoostPulseConst";\nimport { approvalCard } from "./DigitalBoostPulseCard";\n' + t
    if "risk_level" not in t:
        t = t.replace(
            "confirm: boolean;",
            "confirm: boolean;\n  risk?: string;\n  agent?: string;\n  card?: unknown;",
        )
        # after lastAction = pick.action
        if "lastAction = pick.action;" in t:
            t = t.replace(
                "lastAction = pick.action;",
                """lastAction = pick.action;
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
""",
            )
            t = t.replace(
                "return { title: pick.title, body: pick.body, action: pick.action, actionLabel: pick.label, confirm: Boolean(pick.confirm) };",
                """return { title: pick.title, body: pick.body + (confirm ? " · Requiere aprobacion (" + risk + " / " + agent + ")." : " · " + agent + " · " + risk), action: pick.action, actionLabel: confirm ? "Revisar Pulse Card" : pick.label, confirm: confirm, risk: risk, agent: agent, card: card };""",
            )
    kb.write_text(t, encoding="utf-8")
    print("ok kb risk")
else:
    print("WARN no KB")

op = src / "DigitalBoostOperator.tsx"
if op.is_file():
    o = op.read_text(encoding="utf-8")
    if "Pulse Card" not in o and "out.card" not in o:
        o = o.replace(
            "{out && (",
            """{out && out.card && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs leading-5 text-amber-100">
              <div className="font-semibold">Pulse Card · {(out as any).risk || "L3"}</div>
              <p className="mt-1 text-[#AFC0D5]">{out.body}</p>
              <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-amber-200">QUE → POR QUE → IMPACTO → RIESGO</div>
            </div>
          )}
          {out && (""",
            1,
        )
        op.write_text(o, encoding="utf-8")
        print("ok operator card")
print("LISTO CORE 3.0")
print("L0 habla. L3 campana pide card. No inventa stock.")
