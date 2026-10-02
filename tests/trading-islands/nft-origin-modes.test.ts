import assert from "node:assert/strict";
import test from "node:test";

import {
  validateOriginModeConfig,
} from "../../src/trading/nft/origin/modeValidation";

import {
  evaluateOriginModePolicy,
} from "../../src/trading/nft/origin/modePolicy";

import {
  classicOriginModeFixture,
  generativeOriginModeFixture,
  importedOriginModeFixture,
  livingOriginModeFixture,
} from "../../src/trading/nft/origin/modeFixtures";

test(
  "classic mode fixture validates",
  () => {
    const result =
      validateOriginModeConfig(
        "CLASSIC",
        classicOriginModeFixture
      );

    assert.equal(
      result.valid,
      true
    );
  }
);

test(
  "generative mode fixture validates and passes policy",
  () => {
    const validation =
      validateOriginModeConfig(
        "GENERATIVE",
        generativeOriginModeFixture
      );

    const policy =
      evaluateOriginModePolicy(
        "GENERATIVE",
        generativeOriginModeFixture
      );

    assert.equal(
      validation.valid,
      true
    );

    assert.equal(
      policy.accepted,
      true
    );
  }
);

test(
  "living mode fixture validates",
  () => {
    const result =
      validateOriginModeConfig(
        "LIVING",
        livingOriginModeFixture
      );

    assert.equal(
      result.valid,
      true
    );
  }
);

test(
  "imported mode fixture validates",
  () => {
    const result =
      validateOriginModeConfig(
        "IMPORTED",
        importedOriginModeFixture
      );

    assert.equal(
      result.valid,
      true
    );
  }
);

test(
  "mode mismatch is rejected",
  () => {
    const result =
      validateOriginModeConfig(
        "CLASSIC",
        generativeOriginModeFixture
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "MODE_MISMATCH"
      )
    );
  }
);

test(
  "generative mode rejects empty seed",
  () => {
    const profile = {
      ...generativeOriginModeFixture,

      config: {
        ...generativeOriginModeFixture
          .config,

        seed: "",
      },
    };

    const result =
      validateOriginModeConfig(
        "GENERATIVE",
        profile
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "INVALID_GENERATIVE_SEED"
      )
    );
  }
);

test(
  "generative policy rejects non deterministic config",
  () => {
    const profile = {
      ...generativeOriginModeFixture,

      config: {
        ...generativeOriginModeFixture
          .config,

        deterministic:
          false,
      },
    };

    const result =
      evaluateOriginModePolicy(
        "GENERATIVE",
        profile
      );

    assert.equal(
      result.accepted,
      false
    );

    assert.equal(
      result.reason,
      "GENERATIVE_MODE_REQUIRES_DETERMINISTIC_CONFIG"
    );
  }
);

test(
  "living mode rejects missing schema reference",
  () => {
    const profile = {
      ...livingOriginModeFixture,

      config: {
        ...livingOriginModeFixture
          .config,

        evolutionSchemaRef:
          "",
      },
    };

    const result =
      validateOriginModeConfig(
        "LIVING",
        profile
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "INVALID_LIVING_SCHEMA_REFERENCE"
      )
    );
  }
);

test(
  "imported mode rejects missing external asset reference",
  () => {
    const profile = {
      ...importedOriginModeFixture,

      config: {
        ...importedOriginModeFixture
          .config,

        externalAssetRef:
          "",
      },
    };

    const result =
      validateOriginModeConfig(
        "IMPORTED",
        profile
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "INVALID_IMPORT_ASSET_REFERENCE"
      )
    );
  }
);
