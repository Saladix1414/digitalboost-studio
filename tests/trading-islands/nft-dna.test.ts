import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNftDna,
} from "../../src/trading/nft/dna/builder";

import {
  validateNftDna,
} from "../../src/trading/nft/dna/validation";

import {
  deterministicDnaHash,
} from "../../src/trading/nft/dna/hash";

import {
  nftDnaUnmintedFixture,
  nftDnaVerifiedFixture,
} from "../../src/trading/nft/dna/fixtures";

import {
  nftAssetsFixture,
  nftCollectionsFixture,
} from "../../src/trading/nft/fixtures";

test(
  "NFT DNA keeps identity and integrity separate",
  () => {
    assert.equal(
      nftDnaUnmintedFixture.identity
        .assetId,
      "asset-origin-001"
    );

    assert.match(
      nftDnaUnmintedFixture.integrity
        .mediaHash,
      /^dna-[a-f0-9]{8}$/i
    );

    assert.equal(
      nftDnaUnmintedFixture.identity
        .authoritative,
      false
    );

    assert.equal(
      nftDnaUnmintedFixture.integrity
        .authoritative,
      false
    );
  }
);

test(
  "unminted DNA contains no blockchain proof",
  () => {
    assert.equal(
      nftDnaUnmintedFixture
        .blockchainProof,
      null
    );
  }
);

test(
  "verified mint can populate blockchain proof",
  () => {
    const proof =
      nftDnaVerifiedFixture
        .blockchainProof;

    assert.ok(proof);

    assert.equal(
      proof?.tokenId,
      "1"
    );

    assert.equal(
      proof?.owner,
      "owner-local-001"
    );

    assert.equal(
      proof?.mintEventFound,
      true
    );

    assert.equal(
      proof?.authoritative,
      false
    );
  }
);

test(
  "DNA validation accepts deterministic fixtures",
  () => {
    const unminted =
      validateNftDna(
        nftDnaUnmintedFixture
      );

    const verified =
      validateNftDna(
        nftDnaVerifiedFixture
      );

    assert.equal(
      unminted.valid,
      true
    );

    assert.equal(
      verified.valid,
      true
    );
  }
);

test(
  "integrity changes when forge configuration changes",
  () => {
    const asset =
      nftAssetsFixture[0];

    const collection =
      nftCollectionsFixture[0];

    assert.ok(asset);
    assert.ok(collection);

    const first =
      buildNftDna({
        id: "dna-a",
        asset,
        collection,
        mintRecord: null,
        forgeConfig:
          "forge:classic:v1",
        generatedAt:
          "2026-10-04T13:00:00.000Z",
      });

    const second =
      buildNftDna({
        id: "dna-b",
        asset,
        collection,
        mintRecord: null,
        forgeConfig:
          "forge:classic:v2",
        generatedAt:
          "2026-10-04T13:01:00.000Z",
      });

    assert.notEqual(
      first.integrity
        .forgeConfigHash,
      second.integrity
        .forgeConfigHash
    );

    assert.equal(
      first.identity.assetId,
      second.identity.assetId
    );
  }
);

test(
  "deterministic hash is stable",
  () => {
    const first =
      deterministicDnaHash(
        "same-input"
      );

    const second =
      deterministicDnaHash(
        "same-input"
      );

    assert.equal(
      first,
      second
    );
  }
);
