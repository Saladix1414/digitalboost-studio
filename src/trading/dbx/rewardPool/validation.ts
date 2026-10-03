function assertText(
  value: string,
  code: string
) {
  if (value.trim().length === 0) {
    throw new Error(code);
  }
}

export function assertDbxRewardPoolAmount(
  amountMinor: number
) {
  if (
    !Number.isSafeInteger(amountMinor) ||
    amountMinor <= 0
  ) {
    throw new Error(
      "DBX_REWARD_POOL_INVALID_AMOUNT"
    );
  }
}

export function assertDbxRewardPoolAccounts(
  sourceAccountId: string,
  destinationAccountId: string
) {
  assertText(
    sourceAccountId,
    "DBX_REWARD_POOL_SOURCE_REQUIRED"
  );

  assertText(
    destinationAccountId,
    "DBX_REWARD_POOL_DESTINATION_REQUIRED"
  );

  if (
    sourceAccountId ===
    destinationAccountId
  ) {
    throw new Error(
      "DBX_REWARD_POOL_SELF_TRANSFER"
    );
  }
}

export function assertDbxRewardPoolReference(
  reference: string
) {
  assertText(
    reference,
    "DBX_REWARD_POOL_REFERENCE_REQUIRED"
  );
}
