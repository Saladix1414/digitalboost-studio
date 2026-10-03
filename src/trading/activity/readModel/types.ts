import type {
  TradingActivityAuthority,
  TradingActivityDomain,
  TradingActivityEventSeverity,
} from "../types";

export type ActivityCenterReadSource =
  | "LEGACY"
  | "UNIFIED";

export type ActivityCenterReadItem = {
  readonly id:
    string;

  readonly sourceModel:
    ActivityCenterReadSource;

  readonly source:
    string;

  readonly domain:
    TradingActivityDomain | null;

  readonly authority:
    TradingActivityAuthority;

  readonly severity:
    TradingActivityEventSeverity;

  readonly title:
    string;

  readonly message:
    string;

  readonly sourceSequence:
    number;

  readonly occurredAt:
    string | null;

  readonly actorRef:
    string | null;

  readonly references:
    readonly {
      kind: string;
      ref: string;
    }[];

  readonly authoritative:
    false;
};

export type ActivityCenterReadModel = {
  readonly items:
    readonly ActivityCenterReadItem[];

  readonly total:
    number;

  readonly legacyCount:
    number;

  readonly unifiedCount:
    number;

  readonly approvalAuthorityCount:
    number;

  readonly authoritative:
    false;
};

export type ActivityCenterReadFilter = {
  readonly sourceModel?:
    ActivityCenterReadSource;

  readonly domain?:
    TradingActivityDomain;

  readonly authority?:
    TradingActivityAuthority;

  readonly severity?:
    TradingActivityEventSeverity;

  readonly referenceRef?:
    string;
};
