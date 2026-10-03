import type {
  TradingActivityEvent,
  TradingActivityQuery,
  TradingActivityStore,
} from "./types";

export function queryTradingActivity(
  store:
    TradingActivityStore,

  query:
    TradingActivityQuery = {}
): readonly TradingActivityEvent[] {
  let events =
    [...store.events];

  if (
    query.domains &&
    query.domains.length > 0
  ) {
    events =
      events.filter(
        event =>
          query.domains?.includes(
            event.domain
          )
      );
  }

  if (
    query.types &&
    query.types.length > 0
  ) {
    events =
      events.filter(
        event =>
          query.types?.includes(
            event.type
          )
      );
  }

  if (
    query.severities &&
    query.severities.length > 0
  ) {
    events =
      events.filter(
        event =>
          query.severities?.includes(
            event.severity
          )
      );
  }

  if (
    query.actorRef
  ) {
    events =
      events.filter(
        event =>
          event.actor.ref ===
          query.actorRef
      );
  }

  if (
    query.referenceRef
  ) {
    events =
      events.filter(
        event =>
          event.references.some(
            reference =>
              reference.ref ===
              query.referenceRef
          )
      );
  }

  events.sort(
    (a, b) =>
      b.sequence -
      a.sequence
  );

  if (
    query.limit !== undefined
  ) {
    if (
      !Number.isSafeInteger(
        query.limit
      ) ||
      query.limit <= 0
    ) {
      throw new Error(
        "TRADING_ACTIVITY_QUERY_LIMIT_INVALID"
      );
    }

    events =
      events.slice(
        0,
        query.limit
      );
  }

  return events;
}
