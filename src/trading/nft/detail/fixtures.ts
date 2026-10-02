import {
  nftMarketplaceCatalogFixture,
} from "../marketplace/catalog/fixtures";

import {
  buildNftAssetDetail,
} from "./builder";

export const nftAssetDetailFixture =
  buildNftAssetDetail({
    catalogItem:
      nftMarketplaceCatalogFixture[0],
  });

export const nftAssetDetailSecondaryFixture =
  buildNftAssetDetail({
    catalogItem:
      nftMarketplaceCatalogFixture[2],
  });
