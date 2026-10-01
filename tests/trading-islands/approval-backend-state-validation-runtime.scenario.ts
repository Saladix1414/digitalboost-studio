import assert from "node:assert/strict";
import test from "node:test";

import {
  deserializeApprovalBackendReadResponse,
  deserializeApprovalRepositoryState,
} from "../../src/trading/risk/approvalBackendTransport.ts";

import {
  createApprovalHttpBackendClient,
} from "../../src/trading/risk/approvalHttpBackendClient.ts";

import {
  ApprovalHttpClientError,
} from "../../src/trading/risk/approvalHttpClient.ts";

import {
  createApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";


const validReview = {
  id:
    "risk-review-bot-1",

  botId:
    "bot-1",

  strategyId:
    "strategy-1",

  status:
    "approved",

  checks: [
    {
      id:
        "strategy-valid",

      passed:
        true,

      message:
        "Strategy valid.",
    },
    {
      id:
        "paper-only",

      passed:
        true,

      message:
        "Paper only.",
    },
    {
      id:
        "order-limit",

      passed:
        true,

      message:
        "Order limit valid.",
    },
    {
      id:
        "position-limit",

      passed:
        true,

      message:
        "Position limit valid.",
    },
    {
      id:
        "cash-reserve",

      passed:
        true,

      message:
        "Cash reserve valid.",
    },
    {
      id:
        "risk-reward",

      passed:
        true,

      message:
        "Risk reward valid.",
    },
  ],

  approvedFor:
    "paper-only",

  bindingFingerprint:
    "binding:test",

  authoritative:
    true,
} as const;


function validState() {
  return createApprovalRepositoryState(
    validReview,
    "risk-review-workspace"
  );
}


test(
  "valid repository state survives strict remote parsing",
  () => {
    const state =
      validState();

    const parsed =
      deserializeApprovalRepositoryState(
        state
      );

    assert.equal(
      parsed.active?.review.id,
      validReview.id
    );

    assert.equal(
      parsed.authoritative,
      false
    );
  }
);


test(
  "nested malformed authoritative review is rejected",
  () => {
    const state =
      structuredClone(
        validState()
      ) as any;

    state.active.review.authoritative =
      false;

    assert.throws(
      () =>
        deserializeApprovalRepositoryState(
          state
        ),
      /authoritative/
    );
  }
);


test(
  "invalid nested review check is rejected before chain use",
  () => {
    const state =
      structuredClone(
        validState()
      ) as any;

    state.history.entries[0]
      .versionedReview.review
      .checks[0].id =
        "made-up-check";

    assert.throws(
      () =>
        deserializeApprovalRepositoryState(
          state
        ),
      /check/
    );
  }
);


test(
  "malformed provenance is rejected",
  () => {
    const state =
      structuredClone(
        validState()
      ) as any;

    state.history.entries[0]
      .provenance.source =
        "unknown-source";

    assert.throws(
      () =>
        deserializeApprovalRepositoryState(
          state
        ),
      /source/
    );
  }
);


test(
  "semantically broken review chain is rejected",
  () => {
    const state =
      structuredClone(
        validState()
      ) as any;

    state.history.entries[0]
      .provenance.reviewId =
        "different-review";

    assert.throws(
      () =>
        deserializeApprovalRepositoryState(
          state
        ),
      /review chain is invalid/
    );
  }
);


test(
  "active review must match latest history review",
  () => {
    const state =
      structuredClone(
        validState()
      ) as any;

    /*
     * createApprovalRepositoryState shares the same logical review
     * between active and the latest history entry. structuredClone()
     * preserves that aliasing, so detach active before mutating it.
     *
     * This scenario specifically tests repository-level divergence,
     * not provenance corruption.
     */
    state.active = {
      ...state.active,

      review: {
        ...state.active.review,

        id:
          "other-active-review",
      },
    };

    assert.throws(
      () =>
        deserializeApprovalRepositoryState(
          state
        ),
      /active review does not match/
    );
  }
);


test(
  "malformed revisions are rejected",
  () => {
    assert.throws(
      () =>
        deserializeApprovalBackendReadResponse({
          state:
            null,

          revision:
            -1,
        }),
      /revision/
    );

    assert.throws(
      () =>
        deserializeApprovalBackendReadResponse({
          state:
            null,

          revision:
            1.5,
        }),
      /revision/
    );
  }
);


test(
  "empty state cannot claim a persisted revision",
  () => {
    assert.throws(
      () =>
        deserializeApprovalBackendReadResponse({
          state:
            null,

          revision:
            4,
        }),
      /cannot carry a revision/
    );
  }
);


test(
  "HTTP adapter converts malformed remote approval payload to invalid-response",
  async () => {
    const malformed =
      structuredClone(
        validState()
      ) as any;

    malformed.history.entries[0]
      .versionedReview.review
      .authoritative =
        false;

    const client =
      createApprovalHttpBackendClient({
        async request() {
          return {
            status:
              200,

            headers:
              {},

            body:
              JSON.stringify({
                state:
                  malformed,

                revision:
                  1,
              }),
          };
        },
      });

    await assert.rejects(
      () =>
        client.read(),
      (
        error:
          unknown
      ) => {
        assert.ok(
          error instanceof
            ApprovalHttpClientError
        );

        assert.equal(
          error.code,
          "invalid-response"
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
