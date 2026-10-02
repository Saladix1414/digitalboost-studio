import type {
  NftMarketplaceCurrency,
  NftMarketplaceListing,
  NftMarketplaceSaleType,
} from "../types";

export type NftMarketplaceCatalogSort =
  | "NEWEST"
  | "PRICE_ASC"
  | "PRICE_DESC";

export type NftMarketplaceCatalogFilter = {
  readonly query:
    string;

  readonly saleType:
    NftMarketplaceSaleType | null;

  readonly currency:
    NftMarketplaceCurrency | null;

  readonly minPrice:
    number | null;

  readonly maxPrice:
    number | null;

  readonly collectionId:
    string | null;
};

export type NftMarketplaceCatalogItem = {
  readonly listing:
    NftMarketplaceListing;

  readonly title:
    string;

  readonly subtitle:
    string;

  readonly imageRef:
    string | null;

  readonly featured:
    boolean;

  readonly authoritative:
    false;
};

export type NftMarketplaceCatalogResult = {
  readonly items:
    readonly NftMarketplaceCatalogItem[];

  readonly total:
    number;

  readonly authoritative:
    false;
};
