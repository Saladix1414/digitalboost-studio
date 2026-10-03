import type {
  DbxFeePolicy,
} from "./types";

export function validateDbxFeePolicy(
  policy:
    DbxFeePolicy
) {
  if (
    !policy.enabled
  ) {
    throw new Error(
      "DBX_FEE_POLICY_DISABLED"
    );
  }

  if (
    policy.allocations.length === 0
  ) {
    throw new Error(
      "DBX_FEE_POLICY_ALLOCATIONS_REQUIRED"
    );
  }

  const totalBps =
    policy.allocations.reduce(
      (
        sum,
        allocation
      ) =>
        sum +
        allocation.basisPoints,
      0
    );

  if (
    totalBps !==
    10_000
  ) {
    throw new Error(
      "DBX_FEE_POLICY_BPS_INVALID"
    );
  }

  const roles =
    new Set<string>();

  const accounts =
    new Set<string>();

  for (
    const allocation
    of policy.allocations
  ) {
    if (
      !Number.isSafeInteger(
        allocation.basisPoints
      ) ||
      allocation.basisPoints <= 0
    ) {
      throw new Error(
        "DBX_FEE_POLICY_INVALID_ALLOCATION"
      );
    }

    if (
      allocation.accountId
        .trim()
        .length === 0
    ) {
      throw new Error(
        "DBX_FEE_POLICY_ACCOUNT_REQUIRED"
      );
    }

    if (
      roles.has(
        allocation.role
      )
    ) {
      throw new Error(
        "DBX_FEE_POLICY_DUPLICATE_ROLE"
      );
    }

    if (
      accounts.has(
        allocation.accountId
      )
    ) {
      throw new Error(
        "DBX_FEE_POLICY_DUPLICATE_ACCOUNT"
      );
    }

    roles.add(
      allocation.role
    );

    accounts.add(
      allocation.accountId
    );
  }

  return {
    valid:
      true as const,

    policyId:
      policy.id,

    policyVersion:
      policy.version,

    authoritative:
      false as const,
  };
}
