
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
  approvalId?: string;
  policyPassed?: boolean;
  policyLimit?: string;
}): PulseCard {
  const id = opts.approvalId ?? ("appr_" + Date.now().toString(36));
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
    policy_check: {
      passed: opts.policyPassed ?? false,
      limit: opts.policyLimit ?? "Policy pendiente de verificacion",
    },
    buttons: [
      { label: "Confirmar y aplicar", action: "APPROVE" },
      { label: "Rechazar", action: "REJECT" }
    ]
  };
}
