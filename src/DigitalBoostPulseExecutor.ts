import {
  beginPulseExecution,
  completePulseExecution,
  failPulseExecution,
  createPulseAuditEvent,
  type PulseDecisionEnvelope,
  type PulseApproval,
  type PulseExecutionResult,
  type PulseAuditEvent,
} from "./DigitalBoostPulseGovernance";
import { applyPulseDraft, type PulseDraft } from "./DigitalBoostPulseApply";
import {
  applySeoFixProposal,
  validateSeoFixProposal,
  type SeoFixProposal,
} from "./DigitalBoostPulseSeoApply";
import { pushAudit } from "./DigitalBoostPulseLog";

export type PulseExecutionContext = {
  envelope: PulseDecisionEnvelope;
  approval?: PulseApproval | null;
  draft?: PulseDraft;
  proposal?: Record<string, unknown> | null;
  onNavigate?: (action: string) => void;
};

export type PulseExecutionOutcome = {
  allowed: boolean;
  state: "COMPLETED" | "FAILED" | "AWAITING_APPROVAL" | "REJECTED";
  result?: unknown;
  error?: string;
  audit: PulseAuditEvent;
};

function audit(
  envelope: PulseDecisionEnvelope,
  event: string,
  state: PulseDecisionEnvelope["state"],
  metadata?: Record<string, unknown>,
): PulseAuditEvent {
  const next = { ...envelope, state };
  const eventRecord = createPulseAuditEvent(next, event, metadata);

  try {
    pushAudit({
      timestamp: eventRecord.timestamp,
      tenant_id: "digitalboost",
      store_id: String(envelope.metadata?.store_id ?? "digitalboost"),
      actor_type: "merchant",
      request_id: envelope.request_id,
      intent: String(envelope.intent ?? ""),
      agent: String(envelope.agent ?? ""),
      risk_level: envelope.risk,
      tool: envelope.action,
      approval_required: envelope.requires_approval,
      status:
        state === "COMPLETED"
          ? "COMPLETED"
          : state === "FAILED"
            ? "FAILED"
            : state === "REJECTED"
              ? "REJECTED"
              : "AWAITING_APPROVAL",
      result_summary: event,
    });
  } catch {}

  return eventRecord;
}

export function executePulseAction(
  context: PulseExecutionContext,
): PulseExecutionOutcome {
  const { envelope, approval, draft, proposal, onNavigate } = context;

  const executionEnvelope = beginPulseExecution(envelope, approval);

  if (executionEnvelope.state === "REJECTED") {
    return {
      allowed: false,
      state: "REJECTED",
      audit: audit(
        executionEnvelope,
        "PULSE_ACTION_REJECTED",
        "REJECTED",
      ),
    };
  }

  if (executionEnvelope.state === "AWAITING_APPROVAL") {
    return {
      allowed: false,
      state: "AWAITING_APPROVAL",
      audit: audit(
        executionEnvelope,
        "PULSE_ACTION_AWAITING_APPROVAL",
        "AWAITING_APPROVAL",
      ),
    };
  }

  try {
    let result: unknown;

    function validateOptimizeProposal(value: Record<string, unknown>) {
      if (value.type !== "optimize") {
        throw new Error("Unsupported proposal type.");
      }

      const items = value.items;
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Optimize proposal has no items.");
      }

      for (const item of items) {
        if (!item || typeof item !== "object") {
          throw new Error("Optimize proposal contains an invalid item.");
        }

        const candidate = item as Record<string, unknown>;

        if (candidate.type === "hero") {
          if (
            typeof candidate.title !== "string" ||
            typeof candidate.body !== "string" ||
            typeof candidate.cta !== "string"
          ) {
            throw new Error("Optimize hero proposal is invalid.");
          }
          continue;
        }

        if (candidate.type === "seo-fix") {
          const seoValidation = validateSeoFixProposal(candidate);
          if (!seoValidation.ok) {
            throw new Error(seoValidation.error);
          }
          continue;
        }

        throw new Error("Unsupported optimize proposal item.");
      }
    }

    function validateProposal(value: Record<string, unknown>) {
      if (value.type === "seo-fix") {
        const validation = validateSeoFixProposal(value);
        if (!validation.ok) throw new Error(validation.error);
        return;
      }

      if (value.type === "optimize") {
        validateOptimizeProposal(value);
        return;
      }

      throw new Error("Unsupported proposal type.");
    }

    if (proposal) {
      validateProposal(proposal);

      if (proposal.type === "seo-fix") {
        result = applySeoFixProposal(proposal as SeoFixProposal);
      }

      if (proposal.type === "optimize") {
        const items = proposal.items as Array<Record<string, unknown>>;
        const applied: unknown[] = [];

        for (const item of items) {
          if (item.type === "hero") {
            applied.push(
              applyPulseDraft({
                kind: "hero",
                title: String(item.title),
                body: String(item.body),
                cta: String(item.cta),
              }),
            );
          }

          if (item.type === "seo-fix") {
            applied.push(applySeoFixProposal(item as SeoFixProposal));
          }
        }

        result = applied;
      }
    }

    if (!proposal && draft) {
      result = applyPulseDraft(draft);
    }

    if (onNavigate) {
      onNavigate(envelope.action);
    }

    const completed: PulseExecutionResult = completePulseExecution(
      executionEnvelope,
      result,
    );

    const completedEnvelope = {
      ...executionEnvelope,
      state: completed.state,
    };

    return {
      allowed: true,
      state: "COMPLETED",
      result: completed.result,
      audit: audit(
        completedEnvelope,
        "PULSE_ACTION_COMPLETED",
        "COMPLETED",
      ),
    };
  } catch (error) {
    const failed = failPulseExecution(executionEnvelope, error);

    const failedEnvelope = {
      ...executionEnvelope,
      state: failed.state,
    };

    return {
      allowed: false,
      state: "FAILED",
      error: failed.error,
      audit: audit(
        failedEnvelope,
        "PULSE_ACTION_FAILED",
        "FAILED",
        { error: failed.error },
      ),
    };
  }
}
