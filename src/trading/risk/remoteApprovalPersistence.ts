import {
  createApprovalBackendIdempotencyKey,
} from "./approvalBackendTransactions";

import type {
  ApprovalBackendIdempotencyKey,
} from "./approvalBackendTransactions";

import type {
  ApprovalPersistenceLoadResult,
  ApprovalPersistenceMutationContext,
  ApprovalPersistenceRevision,
  ApprovalPersistenceSaveResult,
  ApprovalRepositoryPersistence,
} from "./approvalPersistence";

import type {
  ApprovalRepositoryState,
} from "./reviewRepository";


import {
  runApprovalRemoteMutationWithRetry,
} from "./approvalRemoteRetry";


import {
  recordApprovalRemoteRetryAttempt,
} from "./approvalRemoteRetryHistoryStore";


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
        ApprovalPersistenceRevision | null,

      mutation?:
        ApprovalPersistenceMutationContext
    ):
      Promise<
        ApprovalPersistenceSaveResult
      > {
      const idempotencyKey =
        mutation
          ? createApprovalBackendIdempotencyKey({
              operation:
                "write",

              expectedRevision,

              mutationId:
                mutation.mutationId,
            })
          : null;

      const result =
        await runApprovalRemoteMutationWithRetry({
          idempotencyKey,

          execute:
            async () =>
              client.write({
                state,
                expectedRevision,
                idempotencyKey,
              }),

          onEvent:
            event =>
              recordApprovalRemoteRetryAttempt(
                "write",
                idempotencyKey !== null,
                event
              ),
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
        ApprovalPersistenceRevision | null,

      mutation?:
        ApprovalPersistenceMutationContext
    ):
      Promise<void> {
      const idempotencyKey =
        mutation
          ? createApprovalBackendIdempotencyKey({
              operation:
                "clear",

              expectedRevision,

              mutationId:
                mutation.mutationId,
            })
          : null;

      await runApprovalRemoteMutationWithRetry({
        idempotencyKey,

        execute:
          async () =>
            client.clear({
              expectedRevision,
              idempotencyKey,
            }),

        onEvent:
          event =>
            recordApprovalRemoteRetryAttempt(
              "clear",
              idempotencyKey !== null,
              event
            ),
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
