import type {
  NftMarketplaceAssetReference,
  NftMarketplaceListing,
  NftMarketplacePrice,
  NftMarketplaceSaleType,
  NftMarketplaceSeller,
} from "./types";

export type BuildMarketplaceListingInput = {
  readonly id: string;

  readonly asset:
    NftMarketplaceAssetReference;

  readonly seller:
    NftMarketplaceSeller;

  readonly saleType:
    NftMarketplaceSaleType;

  readonly price:
    NftMarketplacePrice;

  readonly createdAt:
    string;

  readonly expiresAt:
    string | null;
};

export function buildMarketplaceListing(
  input:
    BuildMarketplaceListingInput
): NftMarketplaceListing {
  return {
    id:
      input.id,

    asset:
      input.asset,

    seller:
      input.seller,

    saleType:
      input.saleType,

    price:
      input.price,

    status:
      "DRAFT",

    version:
      1,

    createdAt:
      input.createdAt,

    updatedAt:
      input.createdAt,

    expiresAt:
      input.expiresAt,

    authoritative:
      false,
  };
}
