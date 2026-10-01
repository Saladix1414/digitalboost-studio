import type {
  ApprovalRepositoryState,
} from "./reviewRepository";

export type ApprovalPersistenceLoadResult = {
  readonly state:
    ApprovalRepositoryState | null;

  readonly authoritative:
    false;
};

export interface ApprovalRepositoryPersistence {
  load():
    Promise<ApprovalPersistenceLoadResult>;

  save(
    state:
      ApprovalRepositoryState
  ):
    Promise<void>;

  clear():
    Promise<void>;
}

export type ApprovalStoreLifecycleStatus =
  | "idle"
  | "hydrating"
  | "ready"
  | "error";

export type ApprovalStoreLifecycle = {
  readonly status:
    ApprovalStoreLifecycleStatus;

  readonly error:
    string | null;

  readonly authoritative:
    false;
};

export function createApprovalStoreLifecycle():
  ApprovalStoreLifecycle {
  return {
    status:
      "idle",

    error:
      null,

    authoritative:
      false,
  };
}
