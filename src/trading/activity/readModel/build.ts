import type {
  TradingActivityEvent,
  TradingActivityItem,
} from "../types";

import type {
  ActivityCenterReadItem,
  ActivityCenterReadModel,
} from "./types";

function legacySeverity(
  severity:
    TradingActivityItem["severity"]
):
  ActivityCenterReadItem["severity"] {
  switch (
    severity
  ) {
    case "success":
      return "SUCCESS";

    case "warning":
      return "WARNING";

    case "danger":
      return "ERROR";

    default:
      return "INFO";
  }
}

export function readItemFromLegacyActivity(
  item:
    TradingActivityItem
): ActivityCenterReadItem {
  const references: {
    kind: string;
    ref: string;
  }[] = [];

  if (
    item.referenceId
  ) {
    references.push({
      kind:
        "legacyReference",

      ref:
        item.referenceId,
    });
  }

  if (
    item.botId
  ) {
    references.push({
      kind:
        "bot",

      ref:
        item.botId,
    });
  }

  if (
    item.strategyId
  ) {
    references.push({
      kind:
        "strategy",

      ref:
        item.strategyId,
    });
  }

  return {
    id:
      item.id,

    sourceModel:
      "LEGACY",

    source:
      item.source,

    domain:
      null,

    authority:
      item.authority,

    severity:
      legacySeverity(
        item.severity
      ),

    title:
      item.title,

    message:
      item.message,

    sourceSequence:
      item.sequence,

    /*
     * Historical TradingActivityItem has no timestamp.
     * Do not manufacture one.
     */
    occurredAt:
      null,

    actorRef:
      null,

    references,

    authoritative:
      false,
  };
}

export function readItemFromUnifiedActivity(
  event:
    TradingActivityEvent
): ActivityCenterReadItem {
  return {
    id:
      event.id,

    sourceModel:
      "UNIFIED",

    source:
      event.domain,

    domain:
      event.domain,

    /*
     * Unified Activity Center events are observational.
     */
    authority:
      "none",

    severity:
      event.severity,

    title:
      event.title,

    message:
      event.description,

    sourceSequence:
      event.sequence,

    occurredAt:
      event.occurredAt,

    actorRef:
      event.actor.ref,

    references:
      event.references,

    authoritative:
      false,
  };
}

export function buildActivityCenterReadModel(
  input: {
    readonly legacyItems:
      readonly TradingActivityItem[];

    readonly unifiedEvents:
      readonly TradingActivityEvent[];
  }
): ActivityCenterReadModel {
  const legacy =
    input.legacyItems.map(
      readItemFromLegacyActivity
    );

  const unified =
    input.unifiedEvents.map(
      readItemFromUnifiedActivity
    );

  const items = [
    ...legacy,
    ...unified,
  ];

  return {
    items,

    total:
      items.length,

    legacyCount:
      legacy.length,

    unifiedCount:
      unified.length,

    approvalAuthorityCount:
      items.filter(
        item =>
          item.authority ===
          "approval"
      ).length,

    authoritative:
      false,
  };
}
