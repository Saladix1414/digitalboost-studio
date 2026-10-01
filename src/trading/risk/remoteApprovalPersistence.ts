import type {
  ApprovalBackendIdempotencyKey,
} from "./approvalBackendTransactions";

import type {
  ApprovalPersistenceLoadResult,
  ApprovalPersistenceRevision,
  ApprovalPersistenceSaveResult,
  ApprovalRepositoryPersistence,
} from "./approvalPersistence";

import type {
  ApprovalRepositoryState,
} from "./reviewRepository";


export type ApprovalBackendReadResult = {
  readonly state:
    ApprovalRepositoryState | null;

  readonly revision:
    ApprovalPersistenceRevision | null;

  readonly authoritative:
    false;
};


export type ApprovalBackendWriteInput = {
  readonly state:
    ApprovalRepositoryState;

  readonly expectedRevision:
    ApprovalPersistenceRevision | null;

  readonly idempotencyKey:
    ApprovalBackendIdempotencyKey | null;
};


export type ApprovalBackendWriteResult = {
  readonly revision:
    ApprovalPersistenceRevision;

  readonly authoritative:
    false;
};


export type ApprovalBackendClearInput = {
  readonly expectedRevision:
    ApprovalPersistenceRevision | null;

  readonly idempotencyKey:
    ApprovalBackendIdempotencyKey | null;
};


export interface ApprovalBackendClient {
  read():
    Promise<
      ApprovalBackendReadResult
    >;

  write(
    input:
      ApprovalBackendWriteInput
  ):
    Promise<
      ApprovalBackendWriteResult
    >;

  clear(
    input:
      ApprovalBackendClearInput
  ):
    Promise<void>;
}


export type ApprovalBackendPersistenceBoundary = {
  readonly persistence:
    ApprovalRepositoryPersistence;

  readonly authoritative:
    false;
};


export function createRemoteApprovalPersistence(
  client:
    ApprovalBackendClient
):
  ApprovalRepositoryPersistence {
  return {
    async load():
      Promise<
        ApprovalPersistenceLoadResult
      > {
      const result =
        await client.read();

      return {
        state:
          result.state,

        revision:
          result.revision,

        authoritative:
          false,
      };
    },

    async save(
      state:
        ApprovalRepositoryState,

      expectedRevision:
        ApprovalPersistenceRevision | null
    ):
      Promise<
        ApprovalPersistenceSaveResult
      > {
      const result =
        await client.write({
          state,
          expectedRevision,
          idempotencyKey:
            null,
        });

      return {
        revision:
          result.revision,

        authoritative:
          false,
      };
    },

    async clear(
      expectedRevision:
        ApprovalPersistenceRevision | null
    ):
      Promise<void> {
      await client.clear({
        expectedRevision,
        idempotencyKey:
          null,
      });
    },
  };
}


export function createApprovalBackendPersistenceBoundary(
  client:
    ApprovalBackendClient
):
  ApprovalBackendPersistenceBoundary {
  return {
    persistence:
      createRemoteApprovalPersistence(
        client
      ),

    authoritative:
      false,
  };
}
