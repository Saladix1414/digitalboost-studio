import type {
  ApprovalBootstrapFailurePolicy,
} from "./approvalBootstrapFailurePolicy";


export type ApprovalRecoveryAction =
  | "reset-local-storage"
  | "retry-remote-state";


export type ApprovalRecoveryPresentation = {
  readonly action:
    ApprovalRecoveryAction;

  readonly label:
    "RESET APPROVAL STORAGE"
    | "RETRY REMOTE APPROVAL STATE";

  readonly clearsPersistence:
    boolean;

  readonly authoritative:
    false;
};


export function resolveApprovalRecoveryPresentation(
  policy:
    ApprovalBootstrapFailurePolicy
):
  ApprovalRecoveryPresentation {
  if (
    policy.mode ===
      "remote" ||
    policy.recovery ===
      "manual-rehydrate"
  ) {
    return {
      action:
        "retry-remote-state",

      label:
        "RETRY REMOTE APPROVAL STATE",

      clearsPersistence:
        false,

      authoritative:
        false,
    };
  }

  return {
    action:
      "reset-local-storage",

    label:
      "RESET APPROVAL STORAGE",

    clearsPersistence:
      true,

    authoritative:
      false,
  };
}
