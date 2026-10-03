import type {
  TradingActivityEvent,
  TradingActivityStore,
} from "../types";

import type {
  TradingActivityCorrelationKey,
} from "./types";

function matchesReference(
  event:
    TradingActivityEvent,

  correlation:
    TradingActivityCorrelationKey
) {
  return event.references.some(
    reference =>
      reference.ref ===
        correlation.ref &&
      (
        correlation.kind ===
          "custom" ||
        reference.kind ===
          correlation.kind
      )
  );
}

export function correlateTradingActivity(
  store:
    TradingActivityStore,

  correlation:
    TradingActivityCorrelationKey
) {
  const events =
    store.events.filter(
      event =>
        matchesReference(
          event,
          correlation
        )
    );

  return [...events].sort(
    (a, b) => {
      if (
        a.occurredAt !==
        b.occurredAt
      ) {
        return a.occurredAt
          .localeCompare(
            b.occurredAt
          );
      }

      return (
        a.sequence -
        b.sequence
      );
    }
  );
}
