
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
