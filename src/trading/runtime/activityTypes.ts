import type {
  MarketSymbol,
} from "../types/trading";

export type BotRuntimeEventType =
  | "session_started"
  | "signal_seen"
  | "approval_checked"
  | "approval_rejected"
  | "no_signal"
  | "risk_checked"
  | "order_accepted"
  | "order_rejected"
  | "ledger_updated"
  | "session_completed";

export type BotRuntimeEvent = {
  readonly id:
    string;

  readonly sequence:
    number;

  readonly type:
    BotRuntimeEventType;

  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly symbol:
    MarketSymbol;

  readonly message:
    string;
};

export type BotRuntimeSession = {
  readonly id:
    string;

  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly events:
    readonly BotRuntimeEvent[];

  readonly completed:
    boolean;

  readonly authoritative:
    false;
};
