import {
  buildNftDna,
} from "./builder";

import {
  createNftMintRecord,
} from "../mint/factory";

import {
  markNftMintReady,
  prepareNftMint,
  submitNftMintEvidence,
} from "../mint/engine";

import {
  verifyNftMintWithReplayProtection,
} from "../mint/hardenedVerification";

import {
  createEmptyMintEvidenceRegistry,
} from "../mint/evidenceRegistryFactory";

import {
  nftAssetsFixture,
  nftCollectionsFixture,
} from "../fixtures";

import type {
  NftMintTransactionEvidence,
} from "../mint/types";

const asset =
  nftAssetsFixture.find(
    (item) =>
      item.id ===
      "asset-origin-001"
  );

const collection =
  nftCollectionsFixture.find(
    (item) =>
      item.id ===
      "collection-origin-001"
  );

if (!asset || !collection) {
  throw new Error(
    "DNA_FIXTURE_DEPENDENCY_MISSING"
  );
}

export const nftDnaUnmintedFixture =
  buildNftDna({
    id:
      "dna-origin-001-unminted",

    asset,

    collection,

    mintRecord:
      null,

    forgeConfig:
      "forge:classic:v1",

    generatedAt:
      "2026-10-04T12:00:00.000Z",
  });

let mintRecord =
  createNftMintRecord({
    id:
      "mint-dna-origin-001",

    assetId:
      asset.id,

    collectionId:
      collection.id,

    mode:
      "BASIC",

    expectedOwner:
      "owner-local-001",

    expectedMetadataRef:
      `metadata://${asset.id}`,

    requestedAt:
      "2026-10-04T12:01:00.000Z",
  });

mintRecord =
  markNftMintReady(
    mintRecord,
    nftAssetsFixture,
    nftCollectionsFixture,
    "2026-10-04T12:02:00.000Z"
  );

mintRecord =
  prepareNftMint(
    mintRecord,
    "2026-10-04T12:03:00.000Z"
  );

const evidence:
  NftMintTransactionEvidence = {
  chainId:
    "deterministic-1",

  contractAddress:
    "contract-local-001",

  transactionHash:
    "tx-dna-origin-001",

  blockNumber:
    100,

  receiptStatus:
    "SUCCESS",

  tokenId:
    "1",

  owner:
    "owner-local-001",

  metadataRef:
    `metadata://${asset.id}`,

  mintEventFound:
    true,

  authoritative:
    false,
};

mintRecord =
  submitNftMintEvidence(
    mintRecord,
    evidence,
    "2026-10-04T12:04:00.000Z"
  );

const verified =
  verifyNftMintWithReplayProtection(
    mintRecord,
    createEmptyMintEvidenceRegistry(),
    "2026-10-04T12:05:00.000Z"
  );

export const nftDnaVerifiedFixture =
  buildNftDna({
    id:
      "dna-origin-001-verified",

    asset,

    collection,

    mintRecord:
      verified.record,

    forgeConfig:
      "forge:classic:v1",

    generatedAt:
      "2026-10-04T12:06:00.000Z",
  });
