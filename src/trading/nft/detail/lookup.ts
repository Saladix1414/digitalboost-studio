import type {
  NftMarketplaceCatalogItem,
} from "../marketplace/catalog/types";

import type {
  NftAssetDetail,
} from "./types";

import {
  buildNftAssetDetail,
} from "./builder";

export function findNftAssetDetailByListingId(
  source:
    readonly NftMarketplaceCatalogItem[],
  listingId:
    string
): NftAssetDetail | null {
  const item =
    source.find(
      (entry) =>
        entry.listing.id ===
        listingId
    );

  if (!item) {
    return null;
  }

  return buildNftAssetDetail({
    catalogItem:
      item,
  });
}

export function findNftAssetDetailByAssetId(
  source:
    readonly NftMarketplaceCatalogItem[],
  assetId:
    string
): NftAssetDetail | null {
  const item =
    source.find(
      (entry) =>
        entry.listing.asset.assetId ===
        assetId
    );

  if (!item) {
    return null;
  }

  return buildNftAssetDetail({
    catalogItem:
      item,
  });
}
