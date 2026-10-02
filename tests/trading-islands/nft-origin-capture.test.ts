import assert from "node:assert/strict";
import test from "node:test";

import {
  captureNftOrigin,
} from "../../src/trading/nft/origin/captureEngine";

import {
  captureClassicOrigin,
  captureGenerativeOrigin,
  captureImportedOrigin,
  captureLivingOrigin,
} from "../../src/trading/nft/origin/modeCapture";

import {
  classicOriginCaptureFixture,
  generativeOriginCaptureFixture,
  importedOriginCaptureFixture,
  livingOriginCaptureFixture,
} from "../../src/trading/nft/origin/captureFixtures";

test(
  "classic origin capture succeeds",
  () => {
    const {
      modeConfig,
      ...input
    } =
      classicOriginCaptureFixture;

    const result =
      captureClassicOrigin(
        input,
        modeConfig
      );

    assert.equal(
      result.accepted,
      true
    );

    assert.equal(
      result.record?.context.mode,
      "CLASSIC"
    );

    assert.equal(
      result.record?.authoritative,
      false
    );
  }
);

test(
  "generative origin capture succeeds",
  () => {
    const {
      modeConfig,
      ...input
    } =
      generativeOriginCaptureFixture;

    const result =
      captureGenerativeOrigin(
        input,
        modeConfig
      );

    assert.equal(
      result.accepted,
      true
    );

    assert.equal(
      result.record?.context.mode,
      "GENERATIVE"
    );
  }
);

test(
  "living origin capture succeeds",
  () => {
    const {
      modeConfig,
      ...input
    } =
      livingOriginCaptureFixture;

    const result =
      captureLivingOrigin(
        input,
        modeConfig
      );

    assert.equal(
      result.accepted,
      true
    );

    assert.equal(
      result.record?.context.mode,
      "LIVING"
    );
  }
);

test(
  "imported origin capture succeeds",
  () => {
    const {
      modeConfig,
      ...input
    } =
      importedOriginCaptureFixture;

    const result =
      captureImportedOrigin(
        input,
        modeConfig
      );

    assert.equal(
      result.accepted,
      true
    );

    assert.equal(
      result.record?.context.mode,
      "IMPORTED"
    );
  }
);

test(
  "source mismatch is rejected",
  () => {
    const result =
      captureNftOrigin({
        ...generativeOriginCaptureFixture,

        source: {
          ...generativeOriginCaptureFixture
            .source,

          type:
            "FORGE",
        },
      });

    assert.equal(
      result.accepted,
      false
    );

    assert.equal(
      result.record,
      null
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "SOURCE_TYPE_MISMATCH"
      )
    );
  }
);

test(
  "invalid generative mode config is rejected",
  () => {
    const fixture =
      generativeOriginCaptureFixture;

    const result =
      captureNftOrigin({
        ...fixture,

        modeConfig: {
          ...fixture.modeConfig,

          config: {
            ...fixture.modeConfig.config,

            seed:
              "",
          },
        },
      });

    assert.equal(
      result.accepted,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "INVALID_MODE_CONFIG"
      )
    );
  }
);

test(
  "empty asset id is rejected",
  () => {
    const result =
      captureNftOrigin({
        ...classicOriginCaptureFixture,

        assetId:
          "",
      });

    assert.equal(
      result.accepted,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "EMPTY_ASSET_ID"
      )
    );
  }
);
