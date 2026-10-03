import type {
  DbxConsumptionIntent,
} from "./types";

export type DbxConsumptionHoldSnapshot = {
  readonly id: string;

  readonly accountId: string;

  readonly amountMinor: number;

  readonly purpose: string;

  readonly reference: string;

  readonly status:
    | "ACTIVE"
    | "CAPTURED"
    | "RELEASED"
    | "EXPIRED";

  readonly authoritative:
    false;
};

export type DbxConsumptionHoldBindingCheckCode =
  | "HOLD_ACTIVE"
  | "ACCOUNT_MATCH"
  | "AMOUNT_MATCH"
  | "REFERENCE_MATCH"
  | "PURPOSE_COMPATIBLE";

export type DbxConsumptionHoldBindingCheck = {
  readonly code:
    DbxConsumptionHoldBindingCheckCode;

  readonly passed:
    boolean;
};

export type DbxConsumptionHoldBinding = {
  readonly id: string;

  readonly consumptionIntentId: string;
  readonly holdId: string;

  readonly userAccountId: string;

  readonly amountMinor: number;

  readonly checks:
    readonly DbxConsumptionHoldBindingCheck[];

  readonly verified:
    boolean;

  readonly createdAt:
    string;

  readonly authoritative:
    false;
};

export type DbxConsumptionWithHold = {
  readonly intent:
    DbxConsumptionIntent;

  readonly binding:
    DbxConsumptionHoldBinding;
};
