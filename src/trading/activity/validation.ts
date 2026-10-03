import type {
  TradingActivityEvent,
} from "./types";

function assertText(
  value: string,
  code: string
) {
  if (
    value.trim().length === 0
  ) {
    throw new Error(code);
  }
}

export function validateTradingActivityEvent(
  event:
    TradingActivityEvent
) {
  assertText(
    event.id,
    "TRADING_ACTIVITY_ID_REQUIRED"
  );

  assertText(
    event.title,
    "TRADING_ACTIVITY_TITLE_REQUIRED"
  );

  assertText(
    event.description,
    "TRADING_ACTIVITY_DESCRIPTION_REQUIRED"
  );

  assertText(
    event.actor.ref,
    "TRADING_ACTIVITY_ACTOR_REQUIRED"
  );

  assertText(
    event.occurredAt,
    "TRADING_ACTIVITY_TIME_REQUIRED"
  );

  if (
    !Number.isSafeInteger(
      event.sequence
    ) ||
    event.sequence <= 0
  ) {
    throw new Error(
      "TRADING_ACTIVITY_SEQUENCE_INVALID"
    );
  }

  for (
    const reference
    of event.references
  ) {
    assertText(
      reference.kind,
      "TRADING_ACTIVITY_REFERENCE_KIND_REQUIRED"
    );

    assertText(
      reference.ref,
      "TRADING_ACTIVITY_REFERENCE_REQUIRED"
    );
  }

  return {
    valid:
      true as const,

    authoritative:
      false as const,
  };
}
