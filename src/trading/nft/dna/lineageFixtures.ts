import {
  buildNftDna,
} from "./builder";

import {
  appendNftDnaLineage,
  createInitialNftDnaLineage,
} from "./lineage";

import {
  nftDnaUnmintedFixture,
  nftDnaVerifiedFixture,
} from "./fixtures";

import {
  nftAssetsFixture,
  nftCollectionsFixture,
} from "../fixtures";

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
    "DNA_LINEAGE_FIXTURE_DEPENDENCY_MISSING"
  );
}

const base =
  {
    ...nftDnaUnmintedFixture,
    id:
      "dna-origin-001-lineage",
  };

const updatedAsset = {
  ...asset,

  version:
    asset.version + 1,

  metadata: {
    ...asset.metadata,

    description:
      `${asset.metadata.description} Updated`,
  },
};

const integrityUpdated =
  buildNftDna({
    id:
      "dna-origin-001-lineage",

    asset:
      updatedAsset,

    collection,

    mintRecord:
      null,

    forgeConfig:
      "forge:classic:v2",

    generatedAt:
      "2026-10-05T12:01:00.000Z",
  });

const proofAttached = {
  ...nftDnaVerifiedFixture,
  id:
    "dna-origin-001-lineage",

  identity:
    integrityUpdated.identity,

  integrity:
    integrityUpdated.integrity,
};

let lineage =
  createInitialNftDnaLineage(
    base,
    "2026-10-05T12:00:00.000Z"
  );

lineage =
  appendNftDnaLineage(
    lineage,
    base,
    integrityUpdated,
    "2026-10-05T12:02:00.000Z"
  );

lineage =
  appendNftDnaLineage(
    lineage,
    integrityUpdated,
    proofAttached,
    "2026-10-05T12:03:00.000Z"
  );

export const nftDnaLineageFixture =
  lineage;

export const nftDnaLineageRecordsFixture = {
  base,
  integrityUpdated,
  proofAttached,
} as const;
