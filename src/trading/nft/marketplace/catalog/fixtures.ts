import {
  updateMarketplaceListingStatus,
} from "../engine";

import {
  nftMarketplaceListingFixture,
} from "../fixtures";

import type {
  NftMarketplaceCatalogItem,
} from "./types";

function createListedVariant(
  id:
    string,
  assetId:
    string,
  collectionId:
    string,
  amount:
    number,
  title:
    string,
  createdAt:
    string,
  featured:
    boolean
): NftMarketplaceCatalogItem {
  const draft = {
    ...nftMarketplaceListingFixture,

    id,

    asset: {
      ...nftMarketplaceListingFixture.asset,

      assetId,

      collectionId,
    },

    price: {
      ...nftMarketplaceListingFixture.price,

      amount,
    },

    createdAt,

    updatedAt:
      createdAt,
  };

  const ready =
    updateMarketplaceListingStatus(
      draft,
      "READY",
      createdAt
    );

  const listed =
    updateMarketplaceListingStatus(
      ready,
      "LISTED",
      createdAt
    );

  return {
    listing:
      listed,

    title,

    subtitle:
      collectionId,

    imageRef:
      null,

    featured,

    authoritative:
      false,
  };
}

export const nftMarketplaceCatalogFixture =
  [
    createListedVariant(
      "listing-catalog-001",
      "asset-catalog-001",
      "collection-origin-mode-001",
      250,
      "Origin Genesis #001",
      "2026-10-15T10:00:00.000Z",
      true
    ),

    createListedVariant(
      "listing-catalog-002",
      "asset-catalog-002",
      "collection-origin-mode-001",
      400,
      "Origin Genesis #002",
      "2026-10-15T11:00:00.000Z",
      false
    ),

    createListedVariant(
      "listing-catalog-003",
      "asset-catalog-003",
      "collection-digital-001",
      150,
      "Digital Forge #003",
      "2026-10-15T12:00:00.000Z",
      true
    ),
  ] as const;
