import type {
  NftMarketplaceCatalogItem,
  NftMarketplaceCatalogResult,
} from "./types";

export function queryFeaturedMarketplaceItems(
  source:
    readonly NftMarketplaceCatalogItem[]
): NftMarketplaceCatalogResult {
  const items =
    source.filter(
      (item) =>
        item.featured &&
        item.listing.status ===
          "LISTED"
    );

  return {
    items,

    total:
      items.length,

    authoritative:
      false,
  };
}
