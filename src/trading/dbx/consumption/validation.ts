function assertText(
  value: string,
  code: string
) {
  if (
    value.trim().length === 0
  ) {
    throw new Error(code);
  }
}

export function assertDbxConsumptionAmount(
  amountMinor: number
) {
  if (
    !Number.isSafeInteger(
      amountMinor
    ) ||
    amountMinor <= 0
  ) {
    throw new Error(
      "DBX_CONSUMPTION_INVALID_AMOUNT"
    );
  }
}

export function assertDbxConsumptionAccounts(
  userAccountId: string,
  destinationAccountId: string
) {
  assertText(
    userAccountId,
    "DBX_CONSUMPTION_USER_ACCOUNT_REQUIRED"
  );

  assertText(
    destinationAccountId,
    "DBX_CONSUMPTION_DESTINATION_REQUIRED"
  );

  if (
    userAccountId ===
    destinationAccountId
  ) {
    throw new Error(
      "DBX_CONSUMPTION_SELF_TRANSFER"
    );
  }
}

export function assertDbxConsumptionReference(
  reference: string
) {
  assertText(
    reference,
    "DBX_CONSUMPTION_REFERENCE_REQUIRED"
  );
}
