
import { classifyIntent, classifyRisk, pickAgent, isWriteIntent, type PulseIntent, type PulseRisk, type PulseAgent } from "./DigitalBoostPulseConst";
import {
  classifyPulseIntent,
  type PulseIntentClassification,
} from "./DigitalBoostPulseIntentEngine";
import { type PulseGoalDecision } from "./DigitalBoostPulseGoalEngine";
import { approvalCard, type PulseCard } from "./DigitalBoostPulseCard";
import { pushAudit, requestId } from "./DigitalBoostPulseLog";
import { rememberDecision } from "./DigitalBoostPulseMemory";
import { compilePulseGoal, type PulsePlan } from "./DigitalBoostPulsePlan";
import { startPulseMission, type PulseMission } from "./DigitalBoostPulseMission";
import {
  evaluatePulsePolicy,
  createPulseApproval,
  type PulseDecisionEnvelope,
  type PulseApproval,
} from "./DigitalBoostPulseGovernance";
import { currentContextVersion } from "./DigitalBoostPulseContext";
import { resolvePulseTenantAttribution } from "./DigitalBoostPulseTenant";
import {
  reconcilePulseIntent,
  type PulseIntentReconciliationResult,
} from "./ai/DigitalBoostPulseIntentReconciliation";
import {
  createPulseIntentReconciliationRecord,
  savePulseIntentReconciliationRecord,
  type PulseIntentReconciliationRecord,
} from "./ai/DigitalBoostPulseIntentReconciliationRegistry";
import type {
  PulseInferenceSemanticObservation,
} from "./ai/DigitalBoostPulseInferenceSemanticBoundary";

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
  plan?: PulsePlan;
  mission?: PulseMission;
  intentClassification?: PulseIntentClassification;
  intentReconciliation?: PulseIntentReconciliationResult;
  intentReconciliationRecordId?: string;
  goalDecision?: PulseGoalDecision;
};

export function runCycle(input: {
  q: string;
  section: string;
  store: string;
  tenantId?: string;
  action: string;
  title: string;
  body: string;
  alreadyConfirm: boolean;
  draft?: { kind: string; title: string; body: string; cta: string };
  proposal?: Record<string, unknown> | null;
  contextId?: string;
  semanticObservation?: PulseInferenceSemanticObservation;
}): CycleMeta {
  const contextVersion =
    currentContextVersion({
      store: input.store,
      section: input.section,
    });

  const legacyIntent = classifyIntent(
    input.q,
    input.section,
  );

  const intentClassification =
    classifyPulseIntent({
      q: input.q,
      section: input.section,
      store: input.store,
      tenantId:
        input.tenantId ||
        input.store,
      contextId:
        input.contextId,
      contextVersion,
    });
  const intent = intentClassification.legacyIntent || legacyIntent;
  const write = isWriteIntent(intent) || input.alreadyConfirm;
  const risk = classifyRisk(intent, input.action);
  const agent = pickAgent(intent, input.section);
  const confirm = write || risk === "L2" || risk === "L3" || risk === "L4" || input.alreadyConfirm;
  const rid = requestId();

  // Governance es la fuente de verdad de policy/approval.
  const executionProposal =
    input.proposal !== undefined && input.proposal !== null
      ? input.proposal
      : input.draft !== undefined
        ? input.draft
        : {
            action: input.action,
            title: input.title,
            body: input.body,
          };

  const intentReconciliation =
    input.semanticObservation !== undefined
      ? reconcilePulseIntent({
          intentClassification:
            intentClassification,
          semanticObservation:
            input.semanticObservation,
        })
      : undefined;

  let intentReconciliationRecord:
    PulseIntentReconciliationRecord | undefined;

  const envelope = evaluatePulsePolicy(
    input.action,
    risk,
    confirm,
    rid,
    {
      target: input.store + ":" + input.section + ":" + input.action,
      actor: "merchant",
      tenant: input.store,
      context_version:
        contextVersion,
      proposal: executionProposal,
    },
  );

  const approval =
    envelope.policy === "REQUIRE_APPROVAL"
      ? createPulseApproval(envelope)
      : null;

  if (intentReconciliation !== undefined) {
    intentReconciliationRecord =
      savePulseIntentReconciliationRecord(
        createPulseIntentReconciliationRecord({
          tenantId:
            intentReconciliation.tenantId,
          store:
            input.store,
          requestId:
            envelope.request_id,
          reconciliation:
            intentReconciliation,
        }),
      );
  }

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
  //
  // Tenant attribution:
  // - explicit tenantId wins;
  // - legacy runtime falls back to digitalboost;
  // - this is NOT a security authority.
  const cycleTenant = resolvePulseTenantAttribution({
    explicitTenantId: input.tenantId,
  });

  try {
    pushAudit({
      timestamp: new Date().toISOString(),
      tenant_id: cycleTenant.tenantId,
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
      result_summary:
        intentReconciliationRecord !== undefined
          ? input.title +
            " | reconciliation=" +
            intentReconciliationRecord.recordId +
            " | relation=" +
            intentReconciliationRecord.relation
          : input.title,
      context_version:
        contextVersion,
    });
  } catch {}
  try {
    rememberDecision({
      scope: input.store,
      action: input.action,
      policy: String(envelope.policy),
      requestId: envelope.request_id,
      reason: String(envelope.reason_code || envelope.policy),
    });
  } catch {}

  const plan = compilePulseGoal({
    q: input.q,
    action: input.action,
    section: input.section,
    store: input.store,
    tenantId:
      input.tenantId ||
      input.store,
    contextId:
      input.contextId,
    contextVersion,
    intentClassification,
  });

  const mission =
    envelope.policy === "REJECT" ||
    plan.goal.decision !==
      "ALLOW_GOAL"
      ? undefined
      : startPulseMission({
          store: input.store,
          tenantId: input.tenantId,
          section: input.section,
          plan,
          requestId: envelope.request_id,
          goalEvidence: {
            policy: envelope.policy,
            policyVersion: envelope.policy_version,
            proposalHash:
              envelope.binding?.proposal_hash,
          },
        });

  return {
    request_id: envelope.request_id,
    actor: "merchant",
    tenant: input.store,
    intent: intent,
    intentClassification:
      intentClassification,
    intentReconciliation:
      intentReconciliation,
    intentReconciliationRecordId:
      intentReconciliationRecord?.recordId,
    goalDecision:
      plan.goal.decision,
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
    plan: plan,
    mission: mission,
  };
}
