import type {
  ApprovalPersistenceMode,
} from "./approvalPersistenceMode";


export type ApprovalBootstrapRecovery =
  | "clear-and-rehydrate"
  | "manual-rehydrate";


export type ApprovalBootstrapFailurePolicy = {
  readonly mode:
    ApprovalPersistenceMode;

  readonly fallbackMode:
    null;

  readonly automaticRetry:
    false;

  readonly clearOnFailure:
    boolean;

  readonly recovery:
    ApprovalBootstrapRecovery;

  readonly authoritative:
    false;
};


export function createApprovalBootstrapFailurePolicy(
  mode:
    ApprovalPersistenceMode
):
  ApprovalBootstrapFailurePolicy {
  if (
    mode ===
    "remote"
  ) {
    return {
      mode:
        "remote",

      fallbackMode:
        null,

      automaticRetry:
        false,

      clearOnFailure:
        false,

      recovery:
        "manual-rehydrate",

      authoritative:
        false,
    };
  }

  return {
    mode:
      "local",

    fallbackMode:
      null,

    automaticRetry:
      false,

    clearOnFailure:
      true,

    recovery:
      "clear-and-rehydrate",

    authoritative:
      false,
  };
}
