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
    string;

  readonly strategyId?:
    string;

  readonly referenceId?:
    string;
};
