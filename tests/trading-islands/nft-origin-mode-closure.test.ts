import assert from "node:assert/strict";
import test from "node:test";

import {
  validateOriginModeClosure,
} from "../../src/trading/nft/origin/modeClosure";

import {
  nftOriginModeClosureFixtures,
} from "../../src/trading/nft/origin/modeClosureFixtures";

import {
  generativeOriginCaptureFixture,
  importedOriginCaptureFixture,
} from "../../src/trading/nft/origin/captureFixtures";

test(
  "all four Origin modes close consistently",
  () => {
    for (
      const fixture
      of nftOriginModeClosureFixtures
    ) {
      const result =
        validateOriginModeClosure(
          fixture
        );

      assert.equal(
        result.valid,
        true,
        fixture.modeConfig.mode
      );

      assert.equal(
        result.modeConfigValid,
        true
      );

      assert.equal(
        result.policyAccepted,
        true
      );

      assert.equal(
        result.sourceValid,
        true
      );

      assert.equal(
        result.captureValid,
        true
      );

      assert.equal(
        result.recordValid,
        true
      );

      assert.equal(
        result.authoritative,
        false
      );
    }
  }
);

test(
  "closure rejects source tampering",
  () => {
    const result =
      validateOriginModeClosure({
        ...importedOriginCaptureFixture,

        source: {
          ...importedOriginCaptureFixture
            .source,

          type:
            "FORGE",
        },
      });

    assert.equal(
      result.valid,
      false
    );

    assert.equal(
      result.sourceValid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "SOURCE_POLICY_MISMATCH"
      )
    );
  }
);

test(
  "closure rejects invalid generative determinism",
  () => {
    const fixture =
      generativeOriginCaptureFixture;

    const result =
      validateOriginModeClosure({
        ...fixture,

        modeConfig: {
          ...fixture.modeConfig,

          config: {
            ...fixture.modeConfig.config,

            deterministic:
              false,
          },
        },
      });

    assert.equal(
      result.valid,
      false
    );

    assert.equal(
      result.policyAccepted,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "MODE_POLICY_REJECTED"
      )
    );
  }
);
