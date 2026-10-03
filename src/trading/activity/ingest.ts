import type {
  TradingActivityEvent,
  TradingActivityStore,
} from "./types";

import {
  appendTradingActivityEvent,
} from "./store";

export function ingestTradingActivityEvents(
  store:
    TradingActivityStore,

  events:
    readonly TradingActivityEvent[]
): TradingActivityStore {
  return events.reduce(
    (
      current,
      event
    ) =>
      appendTradingActivityEvent(
        current,
        event
      ),
    store
  );
}
