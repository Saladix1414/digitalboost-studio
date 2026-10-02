import type {
  DbxIssuancePolicy,
} from "./types";

export function validateDbxIssuancePolicy(
  policy:
    DbxIssuancePolicy
) {
  if (
    !Number.isSafeInteger(
      policy.minimumDbxMinor
    ) ||
    policy.minimumDbxMinor <= 0
  ) {
    throw new Error(
      "DBX_ISSUANCE_POLICY_INVALID_MINIMUM"
    );
  }

  if (
    !Number.isSafeInteger(
      policy.maximumDbxMinor
    ) ||
    policy.maximumDbxMinor <
      policy.minimumDbxMinor
  ) {
    throw new Error(
      "DBX_ISSUANCE_POLICY_INVALID_MAXIMUM"
    );
  }

  if (
    policy.issuanceAccountRef
      .trim()
      .length === 0
  ) {
    throw new Error(
      "DBX_ISSUANCE_POLICY_ACCOUNT_REQUIRED"
    );
  }

  return {
    valid:
      true as const,

    policyId:
      policy.id,

    authoritative:
      false as const,
  };
}
