import assert from "node:assert/strict";
import test from "node:test";

import {
  ApprovalBackendError,
  ApprovalBackendIdempotencyConflictError,
  ApprovalBackendRevisionConflictError,
  createApprovalBackendIdempotencyKey,
  isApprovalBackendConflict,
  isRetryableApprovalBackendError,
} from "../../src/trading/risk/approvalBackendTransactions.ts";

import {
  createRemoteApprovalPersistence,
} from "../../src/trading/risk/remoteApprovalPersistence.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";

import type {
  ApprovalBackendClient,
  ApprovalBackendClearInput,
  ApprovalBackendWriteInput,
} from "../../src/trading/risk/remoteApprovalPersistence.ts";

import type {
  ApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";


class MemoryApprovalBackend
  implements ApprovalBackendClient {
  private state:
    ApprovalRepositoryState | null =
      null;

  private revision:
    number | null =
      null;

  private readonly idempotency =
    new Map<
      string,
      {
        readonly operation:
          "write" | "clear";

        readonly revision:
          number | null;
      }
    >();

  failNextRead:
    ApprovalBackendError | null =
      null;

  async read() {
    if (
      this.failNextRead
    ) {
      const error =
        this.failNextRead;

      this.failNextRead =
        null;

      throw error;
    }

    return {
      state:
        this.state,

      revision:
        this.revision,

      authoritative:
        false as const,
    };
  }

  async write(
    input:
      ApprovalBackendWriteInput
  ) {
    if (
      input.idempotencyKey
    ) {
      const previous =
        this.idempotency.get(
          input.idempotencyKey
        );

      if (
        previous
      ) {
        if (
          previous.operation !==
          "write"
        ) {
          throw new ApprovalBackendIdempotencyConflictError({
            operation:
              "write",

            idempotencyKey:
              input.idempotencyKey,
          });
        }

        return {
          revision:
            previous.revision as number,

          authoritative:
            false as const,
        };
      }
    }

    if (
      input.expectedRevision !==
      this.revision
    ) {
      throw new ApprovalBackendRevisionConflictError({
        operation:
          "write",

        expectedRevision:
          input.expectedRevision,

        actualRevision:
          this.revision,
      });
    }

    this.revision =
      (
        this.revision ??
        0
      ) + 1;

    this.state =
      input.state;

    if (
      input.idempotencyKey
    ) {
      this.idempotency.set(
        input.idempotencyKey,
        {
          operation:
            "write",

          revision:
            this.revision,
        }
      );
    }

    return {
      revision:
        this.revision,

      authoritative:
        false as const,
    };
  }

  async clear(
    input:
      ApprovalBackendClearInput
  ) {
    if (
      input.idempotencyKey
    ) {
      const previous =
        this.idempotency.get(
          input.idempotencyKey
        );

      if (
        previous
      ) {
        if (
          previous.operation !==
          "clear"
        ) {
          throw new ApprovalBackendIdempotencyConflictError({
            operation:
              "clear",

            idempotencyKey:
              input.idempotencyKey,
          });
        }

        return;
      }
    }

    if (
      input.expectedRevision !==
      this.revision
    ) {
      throw new ApprovalBackendRevisionConflictError({
        operation:
          "clear",

        expectedRevision:
          input.expectedRevision,

        actualRevision:
          this.revision,
      });
    }

    this.state =
      null;

    this.revision =
      null;

    if (
      input.idempotencyKey
    ) {
      this.idempotency.set(
        input.idempotencyKey,
        {
          operation:
            "clear",

          revision:
            null,
        }
      );
    }
  }
}


test(
  "remote persistence adapter round-trips through backend client",
  async () => {
    const backend =
      new MemoryApprovalBackend();

    const persistence =
      createRemoteApprovalPersistence(
        backend
      );

    const initial =
      await persistence.load();

    assert.equal(
      initial.state,
      null
    );

    assert.equal(
      initial.revision,
      null
    );

    const saved =
      await persistence.save(
        createEmptyApprovalRepositoryState(),
        null
      );

    assert.equal(
      saved.revision,
      1
    );

    const loaded =
      await persistence.load();

    assert.equal(
      loaded.revision,
      1
    );

    assert.deepEqual(
      loaded.state,
      createEmptyApprovalRepositoryState()
    );

    assert.equal(
      loaded.authoritative,
      false
    );
  }
);


test(
  "remote adapter propagates revision conflict from backend",
  async () => {
    const backend =
      new MemoryApprovalBackend();

    const persistence =
      createRemoteApprovalPersistence(
        backend
      );

    await persistence.save(
      createEmptyApprovalRepositoryState(),
      null
    );

    await assert.rejects(
      () =>
        persistence.save(
          createEmptyApprovalRepositoryState(),
          null
        ),
      (
        error:
          unknown
      ) => {
        assert.ok(
          error instanceof
            ApprovalBackendRevisionConflictError
        );

        assert.equal(
          error.expectedRevision,
          null
        );

        assert.equal(
          error.actualRevision,
          1
        );

        assert.equal(
          error.retryable,
          false
        );

        return true;
      }
    );
  }
);


test(
  "revision-aware remote clear rejects stale revision",
  async () => {
    const backend =
      new MemoryApprovalBackend();

    const persistence =
      createRemoteApprovalPersistence(
        backend
      );

    const saved =
      await persistence.save(
        createEmptyApprovalRepositoryState(),
        null
      );

    assert.equal(
      saved.revision,
      1
    );

    await assert.rejects(
      () =>
        persistence.clear(
          null
        ),
      ApprovalBackendRevisionConflictError
    );

    const stillPresent =
      await persistence.load();

    assert.equal(
      stillPresent.revision,
      1
    );

    await persistence.clear(
      1
    );

    const cleared =
      await persistence.load();

    assert.equal(
      cleared.state,
      null
    );

    assert.equal(
      cleared.revision,
      null
    );
  }
);


test(
  "same idempotency key replays write without creating a second revision",
  async () => {
    const backend =
      new MemoryApprovalBackend();

    const idempotencyKey =
      createApprovalBackendIdempotencyKey({
        operation:
          "write",

        expectedRevision:
          null,

        mutationId:
          "mutation-001",
      });

    const input = {
      state:
        createEmptyApprovalRepositoryState(),

      expectedRevision:
        null,

      idempotencyKey,
    };

    const first =
      await backend.write(
        input
      );

    const second =
      await backend.write(
        input
      );

    assert.equal(
      first.revision,
      1
    );

    assert.equal(
      second.revision,
      1
    );

    const loaded =
      await backend.read();

    assert.equal(
      loaded.revision,
      1
    );
  }
);


test(
  "same idempotency key cannot be reused for another mutation type",
  async () => {
    const backend =
      new MemoryApprovalBackend();

    const idempotencyKey =
      "approval:shared-mutation";

    await backend.write({
      state:
        createEmptyApprovalRepositoryState(),

      expectedRevision:
        null,

      idempotencyKey,
    });

    await assert.rejects(
      () =>
        backend.clear({
          expectedRevision:
            1,

          idempotencyKey,
        }),
      ApprovalBackendIdempotencyConflictError
    );
  }
);


test(
  "retryable backend failures remain distinguishable from conflicts",
  async () => {
    const backend =
      new MemoryApprovalBackend();

    backend.failNextRead =
      new ApprovalBackendError({
        message:
          "temporary backend outage",

        code:
          "unavailable",

        operation:
          "read",

        retryable:
          true,
      });

    await assert.rejects(
      () =>
        backend.read(),
      (
        error:
          unknown
      ) => {
        assert.equal(
          isRetryableApprovalBackendError(
            error
          ),
          true
        );

        assert.equal(
          isApprovalBackendConflict(
            error
          ),
          false
        );

        return true;
      }
    );
  }
);


test(
  "revision conflicts are conflicts but not retryable automatically",
  () => {
    const error =
      new ApprovalBackendRevisionConflictError({
        operation:
          "write",

        expectedRevision:
          3,

        actualRevision:
          4,
      });

    assert.equal(
      isApprovalBackendConflict(
        error
      ),
      true
    );

    assert.equal(
      isRetryableApprovalBackendError(
        error
      ),
      false
    );

    assert.equal(
      error.authoritative,
      false
    );
  }
);


test(
  "idempotency key rejects empty mutation identity",
  () => {
    assert.throws(
      () =>
        createApprovalBackendIdempotencyKey({
          operation:
            "write",

          expectedRevision:
            null,

          mutationId:
            "   ",
        }),
      /mutationId is required/
    );
  }
);


test(
  "remote persistence adapter remains non authoritative",
  async () => {
    const backend =
      new MemoryApprovalBackend();

    const persistence =
      createRemoteApprovalPersistence(
        backend
      );

    const loaded =
      await persistence.load();

    assert.equal(
      loaded.authoritative,
      false
    );

    const saved =
      await persistence.save(
        createEmptyApprovalRepositoryState(),
        null
      );

    assert.equal(
      saved.authoritative,
      false
    );
  }
);
