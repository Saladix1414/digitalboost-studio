import type {
  TradingActivityEvent,
  TradingActivityStore,
} from "./types";

import {
  appendTradingActivityEvent,
  createTradingActivityStore,
} from "./store";

type TradingActivityListener =
  () => void;

let store:
  TradingActivityStore =
    createTradingActivityStore();

const listeners =
  new Set<
    TradingActivityListener
  >();

function emitTradingActivityChange():
  void {
  for (
    const listener
    of listeners
  ) {
    listener();
  }
}

export function subscribeTradingActivityStore(
  listener:
    TradingActivityListener
):
  () => void {
  listeners.add(
    listener
  );

  return () => {
    listeners.delete(
      listener
    );
  };
}

export function getTradingActivityStore():
  TradingActivityStore {
  return store;
}

export function getNextTradingActivitySequence():
  number {
  return (
    store.events.length +
    1
  );
}

export function recordTradingActivityEvent(
  event:
    TradingActivityEvent
):
  TradingActivityStore {
  const next =
    appendTradingActivityEvent(
      store,
      event
    );

  /*
   * Exact replay returns the same immutable store.
   * Do not emit a false activity-store change.
   */
  if (
    next === store
  ) {
    return store;
  }

  store =
    next;

  emitTradingActivityChange();

  return store;
}

export function recordTradingActivityEvents(
  events:
    readonly TradingActivityEvent[]
):
  TradingActivityStore {
  let next =
    store;

  for (
    const event
    of events
  ) {
    next =
      appendTradingActivityEvent(
        next,
        event
      );
  }

  if (
    next === store
  ) {
    return store;
  }

  store =
    next;

  emitTradingActivityChange();

  return store;
}

export function resetTradingActivityStoreForTests():
  void {
  store =
    createTradingActivityStore();

  emitTradingActivityChange();
}
