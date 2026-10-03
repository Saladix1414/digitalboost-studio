import type {
  DbxConsumptionIntent,
} from "./types";

import type {
  DbxConsumptionHoldBinding,
  DbxConsumptionWithHold,
} from "./holdBindingTypes";

import {
  assertDbxConsumptionHoldBinding,
} from "./holdBinding";

export function bindDbxConsumptionToHold(
  intent:
    DbxConsumptionIntent,

  binding:
    DbxConsumptionHoldBinding
): DbxConsumptionWithHold {
  assertDbxConsumptionHoldBinding(
    binding
  );

  if (
    binding.consumptionIntentId !==
      intent.id
  ) {
    throw new Error(
      "DBX_CONSUMPTION_BINDING_INTENT_MISMATCH"
    );
  }

  if (
    binding.userAccountId !==
      intent.userAccountId
  ) {
    throw new Error(
      "DBX_CONSUMPTION_BINDING_ACCOUNT_MISMATCH"
    );
  }

  if (
    binding.amountMinor !==
      intent.amountMinor
  ) {
    throw new Error(
      "DBX_CONSUMPTION_BINDING_AMOUNT_MISMATCH"
    );
  }

  return {
    intent,
    binding,
  };
}
