import type {
  TradingActivityEvent,
} from "../types";

export type TradingActivityCorrelationKind =
  | "transaction"
  | "marketplaceOrder"
  | "request"
  | "bot"
  | "strategy"
  | "nft"
  | "consumptionIntent"
  | "lifecycle"
  | "custom";

export type TradingActivityCorrelationKey = {
  readonly kind:
    TradingActivityCorrelationKind;

  readonly ref:
    string;
};

export type TradingActivityTimeline = {
  readonly id:
    string;

  readonly correlation:
    TradingActivityCorrelationKey;

  readonly events:
    readonly TradingActivityEvent[];

  readonly firstOccurredAt:
    string | null;

  readonly lastOccurredAt:
    string | null;

  readonly domains:
    readonly string[];

  readonly authoritative:
    false;
};

export type TradingActivityTimelineSummary = {
  readonly timelineId:
    string;

  readonly correlation:
    TradingActivityCorrelationKey;

  readonly eventCount:
    number;

  readonly domains:
    readonly string[];

  readonly latestEventId:
    string | null;

  readonly latestType:
    string | null;

  readonly latestSeverity:
    string | null;

  readonly authoritative:
    false;
};
