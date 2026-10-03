import type {
  TradingActivityEvent,
} from "../types";

export function collectTradingActivityReferences(
  events:
    readonly TradingActivityEvent[]
) {
  const seen =
    new Set<string>();

  const references: {
    kind: string;
    ref: string;
  }[] = [];

  for (
    const event
    of events
  ) {
    for (
      const reference
      of event.references
    ) {
      const key =
        `${reference.kind}:${reference.ref}`;

      if (
        seen.has(key)
      ) {
        continue;
      }

      seen.add(key);

      references.push({
        kind:
          reference.kind,

        ref:
          reference.ref,
      });
    }
  }

  return references;
}
