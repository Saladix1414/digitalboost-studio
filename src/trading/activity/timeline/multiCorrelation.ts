import type {
  TradingActivityStore,
} from "../types";

import type {
  TradingActivityCorrelationKey,
} from "./types";

import {
  correlateTradingActivity,
} from "./correlation";

export function correlateTradingActivityAcrossKeys(
  store:
    TradingActivityStore,

  correlations:
    readonly TradingActivityCorrelationKey[]
) {
  const byId =
    new Map(
      store.events.map(
        event => [
          event.id,
          event,
        ]
      )
    );

  const matchedIds =
    new Set<string>();

  for (
    const correlation
    of correlations
  ) {
    for (
      const event
      of correlateTradingActivity(
        store,
        correlation
      )
    ) {
      matchedIds.add(
        event.id
      );
    }
  }

  return Array.from(
    matchedIds
  )
    .map(
      id =>
        byId.get(id)
    )
    .filter(
      (
        event
      ): event is NonNullable<
        typeof event
      > =>
        Boolean(event)
    )
    .sort(
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
