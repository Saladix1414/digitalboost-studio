import {
  buildNftOrigin,
} from "./builder";

import {
  validateAndMarkNftOrigin,
} from "./engine";

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
    "ORIGIN_FIXTURE_DEPENDENCY_MISSING"
  );
}

export const nftOriginCapturedFixture =
  buildNftOrigin({
    id:
      "origin-asset-origin-001",

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
        "forge-session-origin-001",

      authoritative:
        false,
    },

    createdAt:
      "2026-10-06T12:00:00.000Z",

    capturedAt:
      "2026-10-06T12:01:00.000Z",
  });

export const nftOriginValidatedFixture =
  validateAndMarkNftOrigin(
    nftOriginCapturedFixture
  );
