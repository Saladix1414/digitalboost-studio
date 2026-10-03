import type {
  TradingActivityActor,
  TradingActivityDomain,
  TradingActivityEvent,
  TradingActivityReference,
  TradingActivityEventSeverity,
  TradingActivityType,
} from "./types";

export function createTradingActivityEvent(
  input: {
    readonly id:
      string;

    readonly domain:
      TradingActivityDomain;

    readonly type:
      TradingActivityType;

    readonly severity:
      TradingActivityEventSeverity;

    readonly title:
      string;

    readonly description:
      string;

    readonly actor:
      TradingActivityActor;

    readonly references?:
      readonly TradingActivityReference[];

    readonly occurredAt:
      string;

    readonly sequence:
      number;
  }
): TradingActivityEvent {
  return {
    id:
      input.id,

    domain:
      input.domain,

    type:
      input.type,

    severity:
      input.severity,

    title:
      input.title,

    description:
      input.description,

    actor:
      input.actor,

    references:
      input.references ?? [],

    occurredAt:
      input.occurredAt,

    sequence:
      input.sequence,

    authoritative:
      false,
  };
}
