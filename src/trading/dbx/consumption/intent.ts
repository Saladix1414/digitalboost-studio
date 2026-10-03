import type {
  DbxConsumptionIntent,
  DbxConsumptionPurpose,
} from "./types";

import {
  assertDbxConsumptionAccounts,
  assertDbxConsumptionAmount,
  assertDbxConsumptionReference,
} from "./validation";

export function createDbxConsumptionIntent(
  input: {
    readonly id: string;
    readonly idempotencyKey: string;

    readonly userAccountId: string;
    readonly destinationAccountId: string;

    readonly amountMinor: number;

    readonly purpose:
      DbxConsumptionPurpose;

    readonly serviceReference: string;

    readonly createdAt: string;
  }
): DbxConsumptionIntent {
  assertDbxConsumptionAmount(
    input.amountMinor
  );

  assertDbxConsumptionAccounts(
    input.userAccountId,
    input.destinationAccountId
  );

  assertDbxConsumptionReference(
    input.serviceReference
  );

  if (
    input.id.trim().length === 0 ||
    input.idempotencyKey
      .trim()
      .length === 0
  ) {
    throw new Error(
      "DBX_CONSUMPTION_IDENTITY_REQUIRED"
    );
  }

  return {
    ...input,

    authoritative:
      false,
  };
}
