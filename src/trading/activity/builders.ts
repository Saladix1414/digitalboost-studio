import type {
  PaperLedgerEntry,
} from "../paper";

import {
  validateRiskReviewProvenance,
} from "../risk";

import type {
  RiskReview,
  RiskReviewHistoryEntry,
} from "../risk";

import type {
  BotRuntimeEvent,
  RuntimeAuditRecord,
} from "../runtime";

import type {
  TradingActivityItem,
  TradingActivitySeverity,
} from "./types";

function severityFromRuntimeEvent(
  type:
    BotRuntimeEvent["type"]
): TradingActivitySeverity {
  switch (
    type
  ) {
    case "order_accepted":
    case "ledger_updated":
      return "success";

    case "approval_rejected":
    case "order_rejected":
      return "danger";

    case "risk_checked":
    case "approval_checked":
      return "warning";

    default:
      return "info";
  }
}

export function activityFromRiskReview(
  review:
    RiskReview,

  sequence =
    1
): TradingActivityItem {
  return {
    id:
      `activity-${review.id}`,

    sequence,

    source:
      "risk-review",

    authority:
      "approval",

    severity:
      review.status ===
      "approved"
        ? "success"
        : "danger",

    title:
      `Risk review ${review.status}`,

    message:
      `Approval scope: ${review.approvedFor}.`,

    botId:
      review.botId,

    strategyId:
      review.strategyId,

    referenceId:
      review.id,
  };
}

export function activityFromRuntimeAudit(
  audit:
    RuntimeAuditRecord,

  startSequence =
    1
): readonly TradingActivityItem[] {
  return audit.events.map(
    (
      event,
      index
    ) => ({
      id:
        `activity-${audit.sessionId}-${event.id}`,

      sequence:
        startSequence +
        index,

      source:
        "runtime" as const,

      authority:
        "none" as const,

      severity:
        severityFromRuntimeEvent(
          event.type
        ),

      title:
        event.type
          .replaceAll(
            "_",
            " "
          )
          .toUpperCase(),

      message:
        event.message,

      botId:
        audit.botId,

      strategyId:
        audit.strategyId,

      referenceId:
        audit.sessionId,
    })
  );
}

export function activityFromPaperLedger(
  entry:
    PaperLedgerEntry,

  sequence:
    number
): TradingActivityItem {
  return {
    id:
      `activity-${entry.id}`,

    sequence,

    source:
      "paper-ledger",

    authority:
      "none",

    severity:
      entry.kind ===
      "fee"
        ? "warning"
        : entry.kind ===
          "trade"
          ? "success"
          : "info",

    title:
      `Paper ${entry.kind}`,

    message:
      entry.note,

    referenceId:
      entry.id,
  };
}

export function activityFromRuntimeAuditSummary(
  audit:
    RuntimeAuditRecord,

  sequence:
    number
): TradingActivityItem {
  return {
    id:
      `activity-audit-${audit.sessionId}`,

    sequence,

    source:
      "runtime",

    authority:
      "none",

    severity:
      audit.decision ===
      "paper-filled"
        ? "success"
        : audit.decision ===
          "approval-rejected" ||
          audit.decision ===
          "risk-rejected" ||
          audit.decision ===
          "paper-rejected"
          ? "danger"
          : "info",

    title:
      "Runtime audit recorded",

    message:
      `Decision ${audit.decision}. Approval evidence ${audit.approval.riskReviewId}.`,

    botId:
      audit.botId,

    strategyId:
      audit.strategyId,

    referenceId:
      audit.sessionId,
  };
}

export function activityFromReviewHistoryEntry(
  entry:
    RiskReviewHistoryEntry,

  sequence:
    number
): TradingActivityItem {
  const {
    versionedReview,
    provenance,
  } = entry;

  const integrity =
    validateRiskReviewProvenance(
      entry
    );

  return {
    id:
      `activity-review-history-${versionedReview.review.id}-v${versionedReview.version}`,

    sequence,

    source:
      "risk-review",

    authority:
      "none",

    severity:
      !integrity.valid
        ? "danger"
        : versionedReview.review.status ===
          "approved"
          ? "info"
          : "warning",

    title:
      integrity.valid
        ? `Risk review v${versionedReview.version} recorded`
        : `Risk review v${versionedReview.version} invalid provenance`,

    message:
      !integrity.valid
        ? `INVALID EVIDENCE · ${integrity.issues.join(", ")}`
        : provenance.supersedes
          ? `${provenance.source} · ${provenance.createdFrom} · supersedes ${provenance.supersedes}`
          : `${provenance.source} · ${provenance.createdFrom} · root review`,

    botId:
      provenance.botId,

    strategyId:
      provenance.strategyId,

    referenceId:
      provenance.reviewId,
  };
}
