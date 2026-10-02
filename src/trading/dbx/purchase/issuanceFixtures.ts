import type {
  DbxIssuancePolicy,
} from "./types";

export const dbxIssuancePolicyFixture:
  DbxIssuancePolicy = {
    id:
      "dbx-issuance-policy-v1",

    version:
      "1",

    enabled:
      true,

    minimumDbxMinor:
      1_000_000,

    maximumDbxMinor:
      10_000_000_000,

    issuanceAccountRef:
      "dbx-system-issuance",

    authoritative:
      false,
  };
