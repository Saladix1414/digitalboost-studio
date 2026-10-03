import type {
  TradingActivityStore,
} from "./types";

export function summarizeTradingActivity(
  store:
    TradingActivityStore
) {
  const latest =
    store.events[
      store.events.length - 1
    ] ?? null;

  return {
    totalEvents:
      store.events.length,

    errors:
      store.events.filter(
        event =>
          event.severity ===
          "ERROR"
      ).length,

    warnings:
      store.events.filter(
        event =>
          event.severity ===
          "WARNING"
      ).length,

    successes:
      store.events.filter(
        event =>
          event.severity ===
          "SUCCESS"
      ).length,

    latestEventId:
      latest?.id ?? null,

    latestDomain:
      latest?.domain ?? null,

    latestOccurredAt:
      latest?.occurredAt ?? null,

    authoritative:
      false as const,
  };
}
