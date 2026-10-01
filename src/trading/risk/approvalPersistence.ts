import type {
  ApprovalRepositoryState,
} from "./reviewRepository";

export type ApprovalPersistenceRevision =
  number;


export type ApprovalPersistenceMutationContext = {
  readonly mutationId:
    string;

  readonly authoritative:
    false;
};

export type ApprovalPersistenceLoadResult = {
  readonly state:
    ApprovalRepositoryState | null;

  readonly revision:
    ApprovalPersistenceRevision | null;

  readonly authoritative:
    false;
};

export type ApprovalPersistenceSaveResult = {
  readonly revision:
    ApprovalPersistenceRevision;

  readonly authoritative:
    false;
};

export interface ApprovalRepositoryPersistence {
  load():
    Promise<ApprovalPersistenceLoadResult>;

  save(
    state:
      ApprovalRepositoryState,

    expectedRevision:
      ApprovalPersistenceRevision | null,

    mutation?:
      ApprovalPersistenceMutationContext
  ):
    Promise<ApprovalPersistenceSaveResult>;

  clear(
    expectedRevision:
      ApprovalPersistenceRevision | null,

    mutation?:
      ApprovalPersistenceMutationContext
  ):
    Promise<void>;
}

export type ApprovalStoreLifecycleStatus =
  | "idle"
  | "hydrating"
  | "ready"
  | "stale"
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
