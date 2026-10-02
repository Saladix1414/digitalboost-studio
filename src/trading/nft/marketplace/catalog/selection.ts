import type {
  NftMarketplaceCatalogItem,
} from "./types";

export type NftMarketplaceCatalogSelection = {
  readonly selectedListingId:
    string | null;

  readonly authoritative:
    false;
};

export function selectMarketplaceCatalogItem(
  current:
    NftMarketplaceCatalogSelection,
  item:
    NftMarketplaceCatalogItem
): NftMarketplaceCatalogSelection {
  if (
    current.selectedListingId ===
      item.listing.id
  ) {
    return {
      selectedListingId:
        null,

      authoritative:
        false,
    };
  }

  return {
    selectedListingId:
      item.listing.id,

    authoritative:
      false,
  };
}

export function isMarketplaceCatalogItemSelected(
  selection:
    NftMarketplaceCatalogSelection,
  item:
    NftMarketplaceCatalogItem
): boolean {
  return (
    selection.selectedListingId ===
    item.listing.id
  );
}
