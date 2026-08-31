
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
