import assert from "node:assert/strict";
import test from "node:test";

import {
  validateOriginAgainstDna,
} from "../../src/trading/nft/origin/dnaBridge";

import {
  validateOriginDnaClosure,
} from "../../src/trading/nft/origin/dnaBridgeClosure";

import {
  nftOriginDnaBridgeDnaFixture,
  nftOriginDnaBridgeLineageFixture,
  nftOriginDnaBridgeOriginFixture,
} from "../../src/trading/nft/origin/dnaBridgeFixtures";

test(
  "origin and DNA fixtures are consistent",
  () => {
    const result =
      validateOriginAgainstDna(
        nftOriginDnaBridgeOriginFixture,
        nftOriginDnaBridgeDnaFixture
      );

    assert.equal(
      result.consistent,
      true
    );

    assert.deepEqual(
      result.issues,
      []
    );
  }
);

test(
  "origin DNA closure passes for consistent domain records",
  () => {
    const result =
      validateOriginDnaClosure(
        nftOriginDnaBridgeOriginFixture,
        nftOriginDnaBridgeDnaFixture,
        nftOriginDnaBridgeLineageFixture
      );

    assert.equal(
      result.valid,
      true
    );

    assert.equal(
      result.originValid,
      true
    );

    assert.equal(
      result.dnaValid,
      true
    );

    assert.equal(
      result.bridgeValid,
      true
    );
  }
);

test(
  "asset id mismatch is rejected",
  () => {
    const origin = {
      ...nftOriginDnaBridgeOriginFixture,

      identity: {
        ...nftOriginDnaBridgeOriginFixture
          .identity,

        assetId:
          "different-asset",
      },
    };

    const result =
      validateOriginAgainstDna(
        origin,
        nftOriginDnaBridgeDnaFixture
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "ASSET_ID_MISMATCH"
      )
    );
  }
);

test(
  "collection id mismatch is rejected",
  () => {
    const origin = {
      ...nftOriginDnaBridgeOriginFixture,

      identity: {
        ...nftOriginDnaBridgeOriginFixture
          .identity,

        collectionId:
          "different-collection",
      },
    };

    const result =
      validateOriginAgainstDna(
        origin,
        nftOriginDnaBridgeDnaFixture
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "COLLECTION_ID_MISMATCH"
      )
    );
  }
);

test(
  "creator mismatch is rejected",
  () => {
    const origin = {
      ...nftOriginDnaBridgeOriginFixture,

      identity: {
        ...nftOriginDnaBridgeOriginFixture
          .identity,

        creator:
          "different-creator",
      },
    };

    const result =
      validateOriginAgainstDna(
        origin,
        nftOriginDnaBridgeDnaFixture
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "CREATOR_MISMATCH"
      )
    );
  }
);

test(
  "forge configuration mismatch is rejected",
  () => {
    const origin = {
      ...nftOriginDnaBridgeOriginFixture,

      context: {
        ...nftOriginDnaBridgeOriginFixture
          .context,

        forgeConfig:
          "forge:tampered:v99",
      },
    };

    const result =
      validateOriginAgainstDna(
        origin,
        nftOriginDnaBridgeDnaFixture
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "FORGE_CONFIG_HASH_MISMATCH"
      )
    );
  }
);
