import type {
  DbxHoldStore,
} from "../../ledger/types";

import {
  releaseDbxConsumptionReservation,
} from "../reservationRelease";

import type {
  DbxConsumptionHoldBinding,
} from "../holdBindingTypes";

import type {
  DbxConsumptionRecoveryState,
} from "./types";

import {
  resolveDbxConsumptionHoldRecoveryAction,
} from "./holdPolicy";

export function applyDbxConsumptionFailureRecovery(
  input: {
    readonly holdStore:
      DbxHoldStore;

    readonly binding:
      DbxConsumptionHoldBinding;

    readonly state:
      DbxConsumptionRecoveryState;

    readonly now:
      string;
  }
) {
  const action =
    resolveDbxConsumptionHoldRecoveryAction(
      input.state
    );

  if (
    action ===
    "KEEP_ACTIVE"
  ) {
    return {
      holdStore:
        input.holdStore,

      action,

      released:
        false as const,
    };
  }

  if (
    action ===
    "CAPTURED"
  ) {
    return {
      holdStore:
        input.holdStore,

      action,

      released:
        false as const,
    };
  }

  const released =
    releaseDbxConsumptionReservation({
      holdStore:
        input.holdStore,

      binding:
        input.binding,

      releasedAt:
        input.now,
    });

  return {
    holdStore:
      released.holdStore,

    action,

    released:
      true as const,
  };
}
