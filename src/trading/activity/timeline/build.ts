import type {
  TradingActivityStore,
} from "../types";

import {
  correlateTradingActivity,
} from "./correlation";

import type {
  TradingActivityCorrelationKey,
  TradingActivityTimeline,
} from "./types";

export function buildTradingActivityTimeline(
  store:
    TradingActivityStore,

  correlation:
    TradingActivityCorrelationKey
): TradingActivityTimeline {
  const events =
    correlateTradingActivity(
      store,
      correlation
    );

  const domains =
    Array.from(
      new Set(
        events.map(
          event =>
            event.domain
        )
      )
    );

  return {
    id:
      `activity-timeline:${correlation.kind}:${correlation.ref}`,

    correlation,

    events,

    firstOccurredAt:
      events[0]
        ?.occurredAt ?? null,

    lastOccurredAt:
      events[
        events.length - 1
      ]?.occurredAt ?? null,

    domains,

    authoritative:
      false,
  };
}
