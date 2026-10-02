import {
  nftDnaLineageFixture,
  nftDnaLineageRecordsFixture,
} from "../dna/lineageFixtures";

import {
  nftOriginValidatedFixture,
} from "./fixtures";

/**
 * PHASE 23C fixture rule:
 *
 * Origin, DNA and lineage must describe the same
 * logical point in time when validating closure.
 *
 * The latest lineage state uses forge:classic:v2
 * and includes the verified blockchain proof.
 */

export const nftOriginDnaBridgeDnaFixture =
  nftDnaLineageRecordsFixture
    .proofAttached;

export const nftOriginDnaBridgeLineageFixture =
  nftDnaLineageFixture;

export const nftOriginDnaBridgeOriginFixture = {
  ...nftOriginValidatedFixture,

  id:
    "origin-dna-bridge-001",

  identity: {
    ...nftOriginValidatedFixture
      .identity,

    assetId:
      nftOriginDnaBridgeDnaFixture
        .identity
        .assetId,

    collectionId:
      nftOriginDnaBridgeDnaFixture
        .identity
        .collectionId,

    creator:
      nftOriginDnaBridgeDnaFixture
        .identity
        .creator,
  },

  context: {
    ...nftOriginValidatedFixture
      .context,

    forgeConfig:
      "forge:classic:v2",

    createdAt:
      nftOriginDnaBridgeDnaFixture
        .identity
        .createdAt,
  },
};
