import assert from "node:assert/strict";
import test from "node:test";

import {
  archiveNftOrigin,
  validateAndMarkNftOrigin,
} from "../../src/trading/nft/origin/engine";

import {
  buildNftOrigin,
} from "../../src/trading/nft/origin/builder";

import {
  canTransitionNftOrigin,
} from "../../src/trading/nft/origin/stateMachine";

import {
  validateNftOrigin,
} from "../../src/trading/nft/origin/validation";

import {
  nftOriginCapturedFixture,
  nftOriginValidatedFixture,
} from "../../src/trading/nft/origin/fixtures";

import {
  nftAssetsFixture,
  nftCollectionsFixture,
} from "../../src/trading/nft/fixtures";

test(
  "origin fixture begins captured and non-authoritative",
  () => {
    assert.equal(
      nftOriginCapturedFixture.status,
      "CAPTURED"
    );

    assert.equal(
      nftOriginCapturedFixture.authoritative,
      false
    );

    assert.equal(
      nftOriginCapturedFixture.context
        .authoritative,
      false
    );
  }
);

test(
  "valid captured origin can transition to validated",
  () => {
    assert.equal(
      nftOriginValidatedFixture.status,
      "VALIDATED"
    );

    assert.equal(
      validateNftOrigin(
        nftOriginValidatedFixture
      ).valid,
      true
    );
  }
);

test(
  "validated origin can be archived",
  () => {
    const archived =
      archiveNftOrigin(
        nftOriginValidatedFixture
      );

    assert.equal(
      archived.status,
      "ARCHIVED"
    );
  }
);

test(
  "origin state machine rejects impossible transitions",
  () => {
    assert.equal(
      canTransitionNftOrigin(
        "CAPTURED",
        "DRAFT"
      ),
      false
    );

    assert.equal(
      canTransitionNftOrigin(
        "ARCHIVED",
        "VALIDATED"
      ),
      false
    );
  }
);

test(
  "origin validation rejects invalid source reference",
  () => {
    const asset =
      nftAssetsFixture[0];

    const collection =
      nftCollectionsFixture[0];

    assert.ok(asset);
    assert.ok(collection);

    const origin =
      buildNftOrigin({
        id:
          "origin-invalid-source",

        asset,

        collection,

        mode:
          "CLASSIC",

        forgeConfig:
          "forge:classic:v1",

        source: {
          type:
            "FORGE",

          reference:
            "",

          authoritative:
            false,
        },

        createdAt:
          "2026-10-06T13:00:00.000Z",

        capturedAt:
          "2026-10-06T13:01:00.000Z",
      });

    const result =
      validateNftOrigin(
        origin
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "INVALID_SOURCE_REFERENCE"
      )
    );
  }
);
