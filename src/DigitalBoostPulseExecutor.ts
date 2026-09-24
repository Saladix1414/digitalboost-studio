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
  inspectSeoFixProposal,
  validateSeoFixProposal,
  type SeoFixProposal,
} from "./DigitalBoostPulseSeoApply";
import { pushExecutionAudit } from "./DigitalBoostPulseLog";
import {
  postcheckPulseExecution,
  precheckPulseExecution,
} from "./DigitalBoostPulseVerify";
import {
  peekCanvasHero,
  undoPulseApply,
} from "./DigitalBoostPulseApply";
import { hashPulseExecutionPayload } from "./DigitalBoostPulseContracts";
import { checkPulseContextDrift } from "./DigitalBoostPulseContextDrift";

export type PulseExecutionTrace = {
  mission_id: string;
  plan_id: string;
  step_id: string;
  step_index: number;
};

export type PulseExecutionContext = {
  envelope: PulseDecisionEnvelope;
  approval?: PulseApproval | null;
  draft?: PulseDraft;
  proposal?: Record<string, unknown> | null;
  onNavigate?: (action: string) => void;
  trace?: PulseExecutionTrace;
};

export type PulseExecutionOutcome = {
  allowed: boolean;
  state: "COMPLETED" | "FAILED" | "AWAITING_APPROVAL" | "REJECTED";
  result?: unknown;
  error?: string;
  verified?: boolean;
  rolledBack?: boolean;
  audit: PulseAuditEvent;
};

function audit(
  envelope: PulseDecisionEnvelope,
  event: string,
  state: PulseDecisionEnvelope["state"],
  metadata?: Record<string, unknown>,
): PulseAuditEvent {
  const next = { ...envelope, state };
  const executionAuditId = "pexaud_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  const auditMetadata = {
    ...(metadata || {}),
    ...(typeof next.metadata?.mission_id === "string"
      ? { mission_id: next.metadata.mission_id }
      : {}),
    ...(typeof next.metadata?.plan_id === "string"
      ? { plan_id: next.metadata.plan_id }
      : {}),
    ...(typeof next.metadata?.step_id === "string"
      ? { step_id: next.metadata.step_id }
      : {}),
    ...(typeof next.metadata?.step_index === "number"
      ? { step_index: next.metadata.step_index }
      : {}),
    ...(next.reason_code
      ? { reason_code: next.reason_code }
      : {}),
    execution_audit_id: executionAuditId,
    execution_audit_event: event,
  };
  const eventRecord = createPulseAuditEvent(
    next,
    event,
    Object.keys(auditMetadata).length > 0
      ? auditMetadata
      : undefined,
  );

  try {
    pushExecutionAudit({
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
      policy_version: envelope.policy_version,
      approval_id: envelope.approval_id,
      proposal_hash: envelope.binding?.proposal_hash,
      executed_proposal_hash:
        typeof metadata?.executed_proposal_hash === "string"
          ? metadata.executed_proposal_hash
          : undefined,
      mission_id:
        typeof auditMetadata.mission_id === "string"
          ? auditMetadata.mission_id
          : undefined,
      plan_id:
        typeof auditMetadata.plan_id === "string"
          ? auditMetadata.plan_id
          : undefined,
      step_id:
        typeof auditMetadata.step_id === "string"
          ? auditMetadata.step_id
          : undefined,
      step_index:
        typeof auditMetadata.step_index === "number"
          ? auditMetadata.step_index
          : undefined,
      reason_code:
        typeof auditMetadata.reason_code === "string"
          ? auditMetadata.reason_code
          : envelope.reason_code,
      verification_status:
        typeof metadata?.verification_status === "string"
          ? metadata.verification_status
          : undefined,
      verified:
        typeof metadata?.verified === "boolean"
          ? metadata.verified
          : undefined,
      rolled_back:
        typeof metadata?.rolled_back === "boolean"
          ? metadata.rolled_back
          : undefined,
      rollback_verified:
        typeof metadata?.rollback_verified === "boolean"
          ? metadata.rollback_verified
          : undefined,
      rollback_reason:
        typeof metadata?.rollback_reason === "string"
          ? metadata.rollback_reason
          : undefined,
      context_version:
        typeof metadata?.expected_context_version === "string"
          ? metadata.expected_context_version
          : undefined,
      current_context_version:
        typeof metadata?.current_context_version === "string"
          ? metadata.current_context_version
          : undefined,
      context_drift_status:
        typeof metadata?.context_drift_status === "string"
          ? metadata.context_drift_status
          : undefined,
      execution_audit_id: executionAuditId,
    }, executionAuditId);
  } catch {}

  return eventRecord;
}

export function executePulseAction(
  context: PulseExecutionContext,
): PulseExecutionOutcome {
  const {
    envelope,
    approval,
    draft,
    proposal,
    onNavigate,
    trace,
  } = context;

  const executionEnvelopeBase = beginPulseExecution(
    envelope,
    approval,
  );

  const executionEnvelope = trace
    ? {
        ...executionEnvelopeBase,
        metadata: {
          ...(executionEnvelopeBase.metadata || {}),
          mission_id: trace.mission_id,
          plan_id: trace.plan_id,
          step_id: trace.step_id,
          step_index: trace.step_index,
        },
      }
    : executionEnvelopeBase;

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

  const contextDrift = checkPulseContextDrift(
    executionEnvelope.binding,
    envelope.action,
  );

  if (
    contextDrift.relevant &&
    contextDrift.status !== "MATCH"
  ) {
    const rejectedEnvelope = {
      ...executionEnvelope,
      state: "REJECTED" as const,
      reason_code: "CONTEXT_STALE" as const,
    };

    return {
      allowed: false,
      state: "REJECTED",
      error: "CONTEXT_STALE",
      verified: false,
      rolledBack: false,
      audit: audit(
        rejectedEnvelope,
        "PULSE_ACTION_REJECTED_CONTEXT_DRIFT",
        "REJECTED",
        {
          expected_context_version:
            contextDrift.expectedContextVersion,
          current_context_version:
            contextDrift.currentContextVersion,
          context_drift_status:
            contextDrift.status,
          verification_status: "SKIPPED",
          verified: false,
        },
      ),
    };
  }

  const executedProposalHash = hashPulseExecutionPayload({
    proposal,
    draft,
  });

  if (executedProposalHash !== null) {
    if (!executionEnvelope.binding) {
      const rejectedEnvelope = {
        ...executionEnvelope,
        state: "REJECTED" as const,
        reason_code: "BINDING_MISSING" as const,
      };

      return {
        allowed: false,
        state: "REJECTED",
        error: "BINDING_MISSING",
        verified: false,
        rolledBack: false,
        audit: audit(
          rejectedEnvelope,
          "PULSE_ACTION_REJECTED_PAYLOAD_BINDING",
          "REJECTED",
          {
            verification_status: "SKIPPED",
            verified: false,
            executed_proposal_hash: executedProposalHash,
          },
        ),
      };
    }

    if (
      executedProposalHash !==
      executionEnvelope.binding.proposal_hash
    ) {
      const rejectedEnvelope = {
        ...executionEnvelope,
        state: "REJECTED" as const,
        reason_code: "STALE_PROPOSAL" as const,
      };

      return {
        allowed: false,
        state: "REJECTED",
        error: "STALE_PROPOSAL",
        verified: false,
        rolledBack: false,
        audit: audit(
          rejectedEnvelope,
          "PULSE_ACTION_REJECTED_PAYLOAD_BINDING",
          "REJECTED",
          {
            verification_status: "SKIPPED",
            verified: false,
            executed_proposal_hash: executedProposalHash,
          },
        ),
      };
    }
  }

  const precheck = precheckPulseExecution({
    action: envelope.action,
    executionState: executionEnvelope.state,
    draft: draft
      ? {
          kind: draft.kind,
          title: draft.title,
          body: draft.body,
          cta: draft.cta,
        }
      : null,
    proposal: proposal ?? null,
  });

  if (precheck.status === "FAIL") {
    const failed = failPulseExecution(
      executionEnvelope,
      new Error("PRECHECK failed"),
    );

    return {
      allowed: false,
      state: "FAILED",
      error: "PRECHECK failed",
      verified: false,
      rolledBack: false,
      audit: audit(
        { ...executionEnvelope, state: failed.state },
        "PULSE_ACTION_PRECHECK_FAILED",
        "FAILED",
        {
          failedChecks: precheck.failedChecks,
          reasonCodes: precheck.reasonCodes,
        },
      ),
    };
  }

  const canvasBeforeRaw = (() => {
    try {
      const page = localStorage.getItem("db-store-page-v1") || "Inicio";
      return {
        page,
        raw:
          localStorage.getItem("db-store-canvas-v1:" + page) ??
          localStorage.getItem("db-store-canvas-v1") ??
          "[]",
      };
    } catch {
      return { page: "Inicio", raw: "[]" };
    }
  })();

  const canvasBeforeHero = peekCanvasHero();

  const themeBefore = (() => {
    try {
      return localStorage.getItem("db-os-theme-v1");
    } catch {
      return null;
    }
  })();

  const seoBeforeRaw = (() => {
    try {
      return localStorage.getItem("db-seo-center-v1");
    } catch {
      return null;
    }
  })();

  let canvasMutationStarted = false;
  let seoMutationStarted = false;
  let themeMutationStarted = false;

  const expected: Record<string, unknown> = {};

  if (draft?.kind === "hero") {
    expected.canvas = {
      title: draft.title,
      body: draft.body,
      cta: draft.cta,
    };
  }

  if (draft?.kind === "cta") {
    expected.canvas = {
      cta: draft.cta,
    };
  }

  if (draft?.kind === "theme") {
    expected.theme =
      /noir/i.test(draft.title + " " + draft.body)
        ? "noir"
        : "nimbus";
  }

  if (proposal?.type === "seo-fix") {
    const inspection = inspectSeoFixProposal(
      proposal as SeoFixProposal,
    );

    expected.seo = [
      {
        pageId: inspection.pageId,
        fixKind: inspection.fixKind,
        issueId: inspection.issueId,
        value: inspection.expectedValue,
        resolved: inspection.expectedResolved,
      },
    ];
  }

  if (proposal?.type === "optimize") {
    const seoExpected: Array<Record<string, unknown>> = [];
    const heroItems: Array<Record<string, unknown>> = [];

    const items = proposal.items as Array<Record<string, unknown>>;

    for (const item of items) {
      if (item.type === "hero") {
        heroItems.push({
          title: String(item.title),
          body: String(item.body),
          cta: String(item.cta),
        });
      }

      if (item.type === "seo-fix") {
        const inspection = inspectSeoFixProposal(
          item as SeoFixProposal,
        );

        seoExpected.push({
          pageId: inspection.pageId,
          fixKind: inspection.fixKind,
          issueId: inspection.issueId,
          value: inspection.expectedValue,
          resolved: inspection.expectedResolved,
        });
      }
    }

    if (heroItems.length > 0) {
      expected.canvas = heroItems[heroItems.length - 1];
    }

    if (seoExpected.length > 0) {
      expected.seo = seoExpected;
    }
  }

  function readCanvasRaw(): string {
    try {
      const page =
        localStorage.getItem("db-store-page-v1") || "Inicio";

      return (
        localStorage.getItem("db-store-canvas-v1:" + page) ??
        localStorage.getItem("db-store-canvas-v1") ??
        "[]"
      );
    } catch {
      return "[]";
    }
  }

  function restoreKey(
    key: string,
    value: string | null,
  ): boolean {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }

      return localStorage.getItem(key) === value;
    } catch {
      return false;
    }
  }

  function rollbackCanvas(): boolean {
    if (!canvasMutationStarted) return true;

    const undone = undoPulseApply();

    if (!undone) return false;

    try {
      const restored =
        readCanvasRaw() === canvasBeforeRaw.raw &&
        JSON.stringify(peekCanvasHero()) ===
          JSON.stringify(canvasBeforeHero);

      return restored;
    } catch {
      return false;
    }
  }

  function rollbackSeo(): boolean {
    if (!seoMutationStarted) return true;

    return restoreKey(
      "db-seo-center-v1",
      seoBeforeRaw,
    );
  }

  function rollbackTheme(): boolean {
    if (!themeMutationStarted) return true;

    const restored = restoreKey(
      "db-os-theme-v1",
      themeBefore,
    );

    try {
      window.dispatchEvent(new Event("db-theme-reload"));
    } catch {}

    return restored;
  }

  function rollbackAll() {
    const canvasOk = rollbackCanvas();
    const seoOk = rollbackSeo();
    const themeOk = rollbackTheme();

    const touched =
      canvasMutationStarted ||
      seoMutationStarted ||
      themeMutationStarted;

    if (!touched) {
      return {
        rolledBack: false,
        rollbackVerified: false,
        rollbackReason: "NO_MUTATION_STARTED",
      };
    }

    const ok = canvasOk && seoOk && themeOk;

    return {
      rolledBack: ok,
      rollbackVerified: ok,
      rollbackReason: ok
        ? "ROLLBACK_VERIFIED"
        : "ROLLBACK_VERIFICATION_FAILED",
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
        seoMutationStarted = true;
        result = applySeoFixProposal(
          proposal as SeoFixProposal,
        );
      }

      if (proposal.type === "optimize") {
        const items = proposal.items as Array<Record<string, unknown>>;
        const applied: unknown[] = [];

        for (const item of items) {
          if (item.type === "hero") {
            canvasMutationStarted = true;

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
      if (
        draft.kind === "hero" ||
        draft.kind === "cta"
      ) {
        canvasMutationStarted = true;
      }

      if (draft.kind === "theme") {
        themeMutationStarted = true;
      }

      result = applyPulseDraft(draft);
    }

    if (onNavigate) {
      onNavigate(envelope.action);
    }

    const actual: Record<string, unknown> = {};

    if (expected.canvas) {
      const hero = peekCanvasHero();
      const canvasExpected =
        expected.canvas as Record<string, unknown>;

      const canvasActual: Record<string, unknown> = {};

      if ("title" in canvasExpected) {
        canvasActual.title = hero.title;
      }

      if ("body" in canvasExpected) {
        canvasActual.body = hero.body;
      }

      if ("cta" in canvasExpected) {
        canvasActual.cta = hero.cta;
      }

      actual.canvas = canvasActual;
    }

    if (expected.theme) {
      try {
        actual.theme =
          localStorage.getItem("db-os-theme-v1");
      } catch {
        actual.theme = null;
      }
    }

    if (expected.seo) {
      if (proposal?.type === "seo-fix") {
        const inspection = inspectSeoFixProposal(
          proposal as SeoFixProposal,
        );

        actual.seo = [
          {
            pageId: inspection.pageId,
            fixKind: inspection.fixKind,
            issueId: inspection.issueId,
            value: inspection.actualValue,
            resolved: inspection.actualResolved,
          },
        ];
      }

      if (proposal?.type === "optimize") {
        const seoActual: Array<Record<string, unknown>> = [];

        const items =
          proposal.items as Array<Record<string, unknown>>;

        for (const item of items) {
          if (item.type !== "seo-fix") continue;

          const inspection =
            inspectSeoFixProposal(
              item as SeoFixProposal,
            );

          seoActual.push({
            pageId: inspection.pageId,
            fixKind: inspection.fixKind,
            issueId: inspection.issueId,
            value: inspection.actualValue,
            resolved: inspection.actualResolved,
          });
        }

        actual.seo = seoActual;
      }
    }

    const post = postcheckPulseExecution({
      action: envelope.action,
      expected,
      actual,
    });

    if (post.status === "FAIL") {
      const rollback = rollbackAll();

      const failed = failPulseExecution(
        executionEnvelope,
        new Error("POSTCHECK failed"),
      );

      return {
        allowed: false,
        state: "FAILED",
        error: "POSTCHECK failed",
        verified: false,
        rolledBack: rollback.rolledBack,
        audit: audit(
          { ...executionEnvelope, state: failed.state },
          "PULSE_ACTION_VERIFY_FAILED",
          "FAILED",
          {
            diffs: post.diffs,
            failedChecks: post.failedChecks,
            reasonCodes: post.reasonCodes,
            verification_status: post.status,
            verified: false,
            rolled_back: rollback.rolledBack,
            rollback_verified:
              rollback.rollbackVerified,
            rollback_reason:
              rollback.rollbackReason,
            executed_proposal_hash:
              executedProposalHash ?? undefined,
          },
        ),
      };
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
      verified: post.verified,
      rolledBack: false,
      audit: audit(
        completedEnvelope,
        "PULSE_ACTION_COMPLETED",
        "COMPLETED",
        {
          verification_status: post.status,
          verified: post.verified,
          rolled_back: false,
          rollback_verified: false,
          executed_proposal_hash:
            executedProposalHash ?? undefined,
          expected_context_version:
            contextDrift.expectedContextVersion,
          current_context_version:
            contextDrift.currentContextVersion,
          context_drift_status:
            contextDrift.status,
        },
      ),
    };
  } catch (error) {
    const rollback = rollbackAll();

    const failed = failPulseExecution(
      executionEnvelope,
      error,
    );

    const failedEnvelope = {
      ...executionEnvelope,
      state: failed.state,
    };

    return {
      allowed: false,
      state: "FAILED",
      error: failed.error,
      verified: false,
      rolledBack: rollback.rolledBack,
      audit: audit(
        failedEnvelope,
        "PULSE_ACTION_FAILED",
        "FAILED",
        {
          error: failed.error,
          verification_status: "EXECUTION_ERROR",
          verified: false,
          rolled_back: rollback.rolledBack,
          rollback_verified:
            rollback.rollbackVerified,
          rollback_reason:
            rollback.rollbackReason,
          executed_proposal_hash:
            executedProposalHash ?? undefined,
        },
      ),
    };
  }
}
