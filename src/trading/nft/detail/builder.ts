import type {
  NftAssetDetail,
  NftDetailSource,
} from "./types";

export function buildNftAssetDetail(
  source:
    NftDetailSource
): NftAssetDetail {
  const item =
    source.catalogItem;

  const listing =
    item.listing;

  return {
    id:
      `detail:${listing.asset.assetId}`,

    title:
      item.title,

    subtitle:
      item.subtitle,

    imageRef:
      item.imageRef,

    featured:
      item.featured,

    identity: {
      assetId:
        listing.asset.assetId,

      collectionId:
        listing.asset.collectionId,

      creatorRef:
        listing.seller.sellerId,

      authoritative:
        false,
    },

    integrity: {
      dnaId:
        listing.asset.dnaId,

      provenanceId:
        listing.asset.provenanceId,

      originId:
        null,

      authoritative:
        false,
    },

    market: {
      listingId:
        listing.id,

      sellerId:
        listing.seller.sellerId,

      walletRef:
        listing.seller.walletRef,

      priceAmount:
        listing.price.amount,

      currency:
        listing.price.currency,

      saleType:
        listing.saleType,

      status:
        listing.status,

      authoritative:
        false,
    },

    authoritative:
      false,
  };
}
