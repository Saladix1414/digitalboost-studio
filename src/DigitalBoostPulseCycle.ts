
import { classifyIntent, classifyRisk, pickAgent, isWriteIntent, type PulseIntent, type PulseRisk, type PulseAgent } from "./DigitalBoostPulseConst";
import { approvalCard, type PulseCard } from "./DigitalBoostPulseCard";
import { pushAudit, requestId } from "./DigitalBoostPulseLog";
import {
  evaluatePulsePolicy,
  createPulseApproval,
  type PulseDecisionEnvelope,
  type PulseApproval,
} from "./DigitalBoostPulseGovernance";

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
  envelope: PulseDecisionEnvelope;
  approval?: PulseApproval | null;
};

export function runCycle(input: { q: string; section: string; store: string; action: string; title: string; body: string; alreadyConfirm: boolean }): CycleMeta {
  const intent = classifyIntent(input.q, input.section);
  const write = isWriteIntent(intent) || input.alreadyConfirm;
  const risk = classifyRisk(intent, input.action);
  const agent = pickAgent(intent, input.section);
  const confirm = write || risk === "L2" || risk === "L3" || risk === "L4" || input.alreadyConfirm;
  const rid = requestId();

  // Governance es la fuente de verdad de policy/approval.
  const envelope = evaluatePulsePolicy(
    input.action,
    risk,
    confirm,
    rid,
  );

  const approval =
    envelope.policy === "REQUIRE_APPROVAL"
      ? createPulseApproval(envelope)
      : null;

  const card =
    envelope.policy === "REQUIRE_APPROVAL"
      ? approvalCard({
          risk: risk,
          name: input.title,
          description: input.body.slice(0, 220),
          reason:
            "Core 4.0 · intent " +
            intent +
            " · write=" +
            String(write) +
            " · policy=" +
            envelope.policy,
          tool: input.action,
          approvalId: envelope.approval_id,
          policyPassed: true,
          policyLimit: "Merchant policy · DigitalBoost OS",
        })
      : undefined;

  // IMPORTANTE: Cycle propone / espera aprobación.
  // Nunca declara SUCCEEDED antes de que el Executor termine.
  try {
    pushAudit({
      timestamp: new Date().toISOString(),
      tenant_id: "digitalboost",
      store_id: input.store,
      actor_type: "merchant",
      request_id: envelope.request_id,
      intent: intent,
      agent: agent,
      risk_level: risk,
      tool: input.action,
      approval_required: envelope.requires_approval,
      status:
        envelope.policy === "REJECT"
          ? "FAILED"
          : envelope.policy === "REQUIRE_APPROVAL"
            ? "AWAITING_APPROVAL"
            : "PENDING",
      result_summary: input.title,
    });
  } catch {}

  return {
    request_id: envelope.request_id,
    actor: "merchant",
    tenant: input.store,
    intent: intent,
    agent: agent,
    risk: risk,
    write: write,
    confirm:
      envelope.policy === "REQUIRE_APPROVAL"
        ? true
        : envelope.policy === "REJECT"
          ? false
          : confirm,
    card: card,
    envelope: envelope,
    approval: approval,
  };
}
