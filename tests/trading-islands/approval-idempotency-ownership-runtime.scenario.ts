import assert from "node:assert/strict";
import test from "node:test";

import {
  createRemoteApprovalPersistence,
} from "../../src/trading/risk/remoteApprovalPersistence.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";

import type {
  ApprovalBackendClearInput,
  ApprovalBackendClient,
  ApprovalBackendWriteInput,
} from "../../src/trading/risk/remoteApprovalPersistence.ts";


test(
  "save mutation context becomes deterministic backend idempotency key",
  async () => {
    let captured:
      ApprovalBackendWriteInput | null =
        null;

    const client:
      ApprovalBackendClient = {
      async read() {
        return {
          state:
            null,

          revision:
            null,

          authoritative:
            false,
        };
      },

      async write(
        input
      ) {
        captured =
          input;

        return {
          revision:
            1,

          authoritative:
            false,
        };
      },

      async clear() {},
    };

    const persistence =
      createRemoteApprovalPersistence(
        client
      );

    await persistence.save(
      createEmptyApprovalRepositoryState(),
      null,
      {
        mutationId:
          "session-a:write:1",

        authoritative:
          false,
      }
    );

    assert.equal(
      captured?.idempotencyKey,
      "approval:write:null:session-a:write:1"
    );
  }
);


test(
  "clear mutation context becomes deterministic backend idempotency key",
  async () => {
    let captured:
      ApprovalBackendClearInput | null =
        null;

    const client:
      ApprovalBackendClient = {
      async read() {
        return {
          state:
            null,

          revision:
            7,

          authoritative:
            false,
        };
      },

      async write() {
        return {
          revision:
            8,

          authoritative:
            false,
        };
      },

      async clear(
        input
      ) {
        captured =
          input;
      },
    };

    const persistence =
      createRemoteApprovalPersistence(
        client
      );

    await persistence.clear(
      7,
      {
        mutationId:
          "session-a:clear:2",

        authoritative:
          false,
      }
    );

    assert.equal(
      captured?.idempotencyKey,
      "approval:clear:7:session-a:clear:2"
    );
  }
);


test(
  "legacy two-argument persistence calls remain compatible",
  async () => {
    let captured:
      ApprovalBackendWriteInput | null =
        null;

    const client:
      ApprovalBackendClient = {
      async read() {
        return {
          state:
            null,

          revision:
            null,

          authoritative:
            false,
        };
      },

      async write(
        input
      ) {
        captured =
          input;

        return {
          revision:
            1,

          authoritative:
            false,
        };
      },

      async clear() {},
    };

    const persistence =
      createRemoteApprovalPersistence(
        client
      );

    await persistence.save(
      createEmptyApprovalRepositoryState(),
      null
    );

    assert.equal(
      captured?.idempotencyKey,
      null
    );
  }
);
