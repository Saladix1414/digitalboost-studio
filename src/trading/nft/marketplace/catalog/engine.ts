import type {
  NftMarketplaceCatalogFilter,
  NftMarketplaceCatalogItem,
  NftMarketplaceCatalogResult,
  NftMarketplaceCatalogSort,
} from "./types";

function includesQuery(
  item:
    NftMarketplaceCatalogItem,
  query:
    string
): boolean {
  const normalized =
    query
      .trim()
      .toLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    item.title,
    item.subtitle,
    item.listing.asset.assetId,
    item.listing.asset.collectionId,
    item.listing.seller.sellerId,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function matchesPrice(
  item:
    NftMarketplaceCatalogItem,
  minPrice:
    number | null,
  maxPrice:
    number | null
): boolean {
  const amount =
    item.listing.price.amount;

  if (
    minPrice !== null &&
    amount < minPrice
  ) {
    return false;
  }

  if (
    maxPrice !== null &&
    amount > maxPrice
  ) {
    return false;
  }

  return true;
}

export function queryMarketplaceCatalog(
  source:
    readonly NftMarketplaceCatalogItem[],
  filter:
    NftMarketplaceCatalogFilter,
  sort:
    NftMarketplaceCatalogSort
): NftMarketplaceCatalogResult {
  const filtered =
    source.filter(
      (item) => {
        const listing =
          item.listing;

        if (
          listing.status !==
            "LISTED"
        ) {
          return false;
        }

        if (
          !includesQuery(
            item,
            filter.query
          )
        ) {
          return false;
        }

        if (
          filter.saleType !==
            null &&
          listing.saleType !==
            filter.saleType
        ) {
          return false;
        }

        if (
          filter.currency !==
            null &&
          listing.price.currency !==
            filter.currency
        ) {
          return false;
        }

        if (
          filter.collectionId !==
            null &&
          listing.asset.collectionId !==
            filter.collectionId
        ) {
          return false;
        }

        if (
          !matchesPrice(
            item,
            filter.minPrice,
            filter.maxPrice
          )
        ) {
          return false;
        }

        return true;
      }
    );

  const sorted =
    [...filtered];

  switch (sort) {
    case "PRICE_ASC":
      sorted.sort(
        (a, b) =>
          a.listing.price.amount -
          b.listing.price.amount
      );
      break;

    case "PRICE_DESC":
      sorted.sort(
        (a, b) =>
          b.listing.price.amount -
          a.listing.price.amount
      );
      break;

    case "NEWEST":
      sorted.sort(
        (a, b) =>
          b.listing.createdAt.localeCompare(
            a.listing.createdAt
          )
      );
      break;
  }

  return {
    items:
      sorted,

    total:
      sorted.length,

    authoritative:
      false,
  };
}
