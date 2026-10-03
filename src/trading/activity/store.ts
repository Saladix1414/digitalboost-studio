import type {
  TradingActivityEvent,
  TradingActivityStore,
} from "./types";

import {
  validateTradingActivityEvent,
} from "./validation";

export function createTradingActivityStore():
  TradingActivityStore {
  return {
    events:
      [],
  };
}

export function appendTradingActivityEvent(
  store:
    TradingActivityStore,

  event:
    TradingActivityEvent
): TradingActivityStore {
  validateTradingActivityEvent(
    event
  );

  const existing =
    store.events.find(
      candidate =>
        candidate.id ===
        event.id
    );

  if (existing) {
    if (
      JSON.stringify(existing) ===
      JSON.stringify(event)
    ) {
      return store;
    }

    throw new Error(
      "TRADING_ACTIVITY_EVENT_CONFLICT"
    );
  }

  const expectedSequence =
    store.events.length + 1;

  if (
    event.sequence !==
    expectedSequence
  ) {
    throw new Error(
      "TRADING_ACTIVITY_SEQUENCE_CONFLICT"
    );
  }

  return {
    events: [
      ...store.events,
      event,
    ],
  };
}
