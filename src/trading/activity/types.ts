/*
 * =========================================================
 * LEGACY / CANONICAL TRADING ACTIVITY CONTRACT
 * =========================================================
 *
 * These types predate Phase 32 and are consumed by:
 *
 * - strategy activity
 * - risk review activity
 * - runtime activity
 * - paper ledger activity
 * - recovery activity
 * - remote retry history
 *
 * DO NOT replace or rename these contracts.
 */

export type TradingActivitySource =
  | "strategy"
  | "risk-review"
  | "runtime"
  | "paper-ledger"
  | "recovery"
  | "remote-retry";

export type TradingActivityAuthority =
  | "none"
  | "approval";

export type TradingActivitySeverity =
  | "info"
  | "success"
  | "warning"
  | "danger";

export type TradingActivityItem = {
  readonly id:
    string;

  readonly sequence:
    number;

  readonly source:
    TradingActivitySource;

  readonly authority:
    TradingActivityAuthority;

  readonly severity:
    TradingActivitySeverity;

  readonly title:
    string;

  readonly message:
    string;

  readonly botId?:
    string | null;

  readonly strategyId?:
    string | null;

  readonly referenceId?:
    string | null;
};


/*
 * =========================================================
 * PHASE 32 — UNIFIED ACTIVITY CENTER MODEL
 * =========================================================
 *
 * This model extends the existing activity subsystem.
 *
 * It does NOT replace TradingActivityItem.
 */

export type TradingActivityDomain =
  | "DBX"
  | "MARKETPLACE"
  | "NFT"
  | "BLOCKCHAIN"
  | "TRADING"
  | "BOT"
  | "RUNTIME"
  | "SECURITY"
  | "SYSTEM";

export type TradingActivityType =
  | "CREATED"
  | "UPDATED"
  | "STARTED"
  | "COMPLETED"
  | "FAILED"
  | "RETRY_PENDING"
  | "CANCELLED"
  | "VERIFIED"
  | "POSTED"
  | "CAPTURED"
  | "RELEASED"
  | "SUBMITTED"
  | "INDEXED"
  | "LISTED"
  | "MATCHED"
  | "SETTLED"
  | "BLOCKED"
  | "WARNING";

export type TradingActivityEventSeverity =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

export type TradingActivityActorType =
  | "USER"
  | "SYSTEM"
  | "CREATOR"
  | "OPERATOR"
  | "BOT"
  | "UNKNOWN";

export type TradingActivityActor = {
  readonly type:
    TradingActivityActorType;

  readonly ref:
    string;
};

export type TradingActivityReference = {
  readonly kind:
    string;

  readonly ref:
    string;
};

export type TradingActivityEvent = {
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

  readonly references:
    readonly TradingActivityReference[];

  readonly occurredAt:
    string;

  readonly sequence:
    number;

  readonly authoritative:
    false;
};

export type TradingActivityStore = {
  readonly events:
    readonly TradingActivityEvent[];
};

export type TradingActivityQuery = {
  readonly domains?:
    readonly TradingActivityDomain[];

  readonly types?:
    readonly TradingActivityType[];

  readonly severities?:
    readonly TradingActivityEventSeverity[];

  readonly actorRef?:
    string;

  readonly referenceRef?:
    string;

  readonly limit?:
    number;
};
