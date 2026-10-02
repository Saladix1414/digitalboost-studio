import type {
  NftMarketplaceCatalogFilter,
} from "./types";

export type NftMarketplaceQuickFilter =
  | "ALL"
  | "FEATURED"
  | "UNDER_300"
  | "ORIGIN_GENESIS"
  | "DIGITAL_FORGE";

export function applyMarketplaceQuickFilter(
  quickFilter:
    NftMarketplaceQuickFilter
): Partial<NftMarketplaceCatalogFilter> {
  switch (quickFilter) {
    case "UNDER_300":
      return {
        maxPrice:
          300,
      };

    case "ORIGIN_GENESIS":
      return {
        collectionId:
          "collection-origin-mode-001",
      };

    case "DIGITAL_FORGE":
      return {
        collectionId:
          "collection-digital-001",
      };

    case "FEATURED":
    case "ALL":
      return {};
  }
}
