import type {
  DbxHoldStore,
} from "../ledger/types";

import {
  releaseDbxHold,
} from "../ledger/holdLifecycle";

import type {
  DbxConsumptionHoldBinding,
} from "./holdBindingTypes";

export function releaseDbxConsumptionReservation(
  input: {
    readonly holdStore:
      DbxHoldStore;

    readonly binding:
      DbxConsumptionHoldBinding;

    readonly releasedAt:
      string;
  }
) {
  const hold =
    input.holdStore.holds.find(
      candidate =>
        candidate.id ===
        input.binding.holdId
    );

  if (!hold) {
    throw new Error(
      "DBX_CONSUMPTION_HOLD_NOT_FOUND"
    );
  }

  if (
    hold.status ===
      "RELEASED"
  ) {
    return {
      holdStore:
        input.holdStore,

      hold,

      idempotentReplay:
        true,
    };
  }

  if (
    hold.status ===
      "CAPTURED"
  ) {
    throw new Error(
      "DBX_CONSUMPTION_CAPTURED_HOLD_CANNOT_RELEASE"
    );
  }

  if (
    hold.status ===
      "EXPIRED"
  ) {
    throw new Error(
      "DBX_CONSUMPTION_EXPIRED_HOLD_CANNOT_RELEASE"
    );
  }

  const released =
    releaseDbxHold(
      input.holdStore,
      hold.id,
      input.releasedAt
    );

  return {
    holdStore:
      released.store,

    hold:
      released.hold,

    idempotentReplay:
      false,
  };
}
