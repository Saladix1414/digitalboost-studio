import {
  useMemo,
  useState,
} from "react";

import {
  Filter,
  Search,
  Sparkles,
} from "lucide-react";

import {
  queryMarketplaceCatalog,
} from "./engine";

import {
  nftMarketplaceCatalogFixture,
} from "./fixtures";

import {
  defaultMarketplaceCatalogFilter,
} from "./defaultQuery";

import type {
  NftMarketplaceCatalogSort,
} from "./types";

import {
  queryFeaturedMarketplaceItems,
} from "./featured";

import {
  applyMarketplaceQuickFilter,
} from "./quickFilters";

import type {
  NftMarketplaceQuickFilter,
} from "./quickFilters";

import {
  isMarketplaceCatalogItemSelected,
  selectMarketplaceCatalogItem,
} from "./selection";

import {
  findNftAssetDetailByListingId,
} from "../../detail/lookup";

import NftDetailWorkspace from "../../detail/NftDetailWorkspace";

export function NftMarketplaceCatalogWorkspace() {
  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    sort,
    setSort,
  ] =
    useState<NftMarketplaceCatalogSort>(
      "NEWEST"
    );

  const [
    collectionId,
    setCollectionId,
  ] =
    useState<string | null>(
      null
    );

  const [
    quickFilter,
    setQuickFilter,
  ] =
    useState<NftMarketplaceQuickFilter>(
      "ALL"
    );

  const [
    selection,
    setSelection,
  ] =
    useState({
      selectedListingId:
        null as string | null,

      authoritative:
        false as const,
    });

  const [
    detailListingId,
    setDetailListingId,
  ] =
    useState<string | null>(
      null
    );

  const result =
    useMemo(
      () => {
        if (
          quickFilter ===
            "FEATURED"
        ) {
          return queryFeaturedMarketplaceItems(
            nftMarketplaceCatalogFixture
          );
        }

        const quick =
          applyMarketplaceQuickFilter(
            quickFilter
          );

        return queryMarketplaceCatalog(
          nftMarketplaceCatalogFixture,
          {
            ...defaultMarketplaceCatalogFilter,
            ...quick,

            query,

            collectionId:
              quick.collectionId ??
              collectionId,
          },
          sort
        );
      },
      [
        query,
        collectionId,
        sort,
        quickFilter,
      ]
    );

  const detail =
    detailListingId
      ? findNftAssetDetailByListingId(
          nftMarketplaceCatalogFixture,
          detailListingId
        )
      : null;

  if (detail) {
    return (
      <NftDetailWorkspace
        detail={detail}
        onBack={
          () =>
            setDetailListingId(
              null
            )
        }
      />
    );
  }

  return (
    <section
      className="ti-market-catalog"
      data-marketplace-catalog
      data-authority="none"
    >
      <header className="ti-market-catalog__hero">
        <div>
          <span className="ti-label">
            Marketplace Discovery
          </span>

          <h3>
            Explore Listed Digital Assets
          </h3>

          <p>
            Search, filter and inspect local marketplace listings before opening asset detail.
          </p>
        </div>

        <Sparkles
          size={22}
          strokeWidth={1.4}
        />
      </header>

      <section className="ti-market-catalog__quick-filters">
        {[
          ["ALL", "All"],
          ["FEATURED", "Featured"],
          ["UNDER_300", "Under 300"],
          ["ORIGIN_GENESIS", "Origin Genesis"],
          ["DIGITAL_FORGE", "Digital Forge"],
        ].map(
          ([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                quickFilter === value
                  ? "is-active"
                  : undefined
              }
              onClick={
                () =>
                  setQuickFilter(
                    value as NftMarketplaceQuickFilter
                  )
              }
            >
              {label}
            </button>
          )
        )}
      </section>

      <section className="ti-market-catalog__controls">
        <label className="ti-market-catalog__search">
          <Search
            size={14}
          />

          <input
            type="search"
            value={query}
            placeholder="Search assets, collections or sellers"
            onChange={
              (event) =>
                setQuery(
                  event.target.value
                )
            }
          />
        </label>

        <label>
          <Filter
            size={13}
          />

          <select
            value={
              collectionId ??
              ""
            }
            onChange={
              (event) =>
                setCollectionId(
                  event.target.value
                    ? event.target.value
                    : null
                )
            }
          >
            <option value="">
              All collections
            </option>

            <option value="collection-origin-mode-001">
              Origin Genesis
            </option>

            <option value="collection-digital-001">
              Digital Forge
            </option>
          </select>
        </label>

        <label>
          <span>
            Sort
          </span>

          <select
            value={sort}
            onChange={
              (event) =>
                setSort(
                  event.target
                    .value as NftMarketplaceCatalogSort
                )
            }
          >
            <option value="NEWEST">
              Newest
            </option>

            <option value="PRICE_ASC">
              Price: Low to High
            </option>

            <option value="PRICE_DESC">
              Price: High to Low
            </option>
          </select>
        </label>
      </section>

      <div className="ti-market-catalog__selection-status">
        <span>
          Selected
        </span>

        <strong>
          {
            selection.selectedListingId ??
            "none"
          }
        </strong>
      </div>

      <div className="ti-market-catalog__summary">
        <span>
          {
            result.total
          }
          {" "}
          listed assets
        </span>

        <span>
          authority:none
        </span>
      </div>

      <section className="ti-market-catalog__grid">
        {
          result.items.map(
            (item) => (
              <article
                key={
                  item.listing.id
                }
                className={
                  isMarketplaceCatalogItemSelected(
                    selection,
                    item
                  )
                    ? "ti-market-card is-selected"
                    : "ti-market-card"
                }
                data-market-card
                data-selected={
                  isMarketplaceCatalogItemSelected(
                    selection,
                    item
                  )
                    ? "true"
                    : "false"
                }
                onClick={
                  () =>
                    setSelection(
                      (current) =>
                        selectMarketplaceCatalogItem(
                          current,
                          item
                        )
                    )
                }
              >
                <div className="ti-market-card__media">
                  <div>
                    {
                      item.featured
                        ? "FEATURED"
                        : "LISTED"
                    }
                  </div>
                </div>

                <div className="ti-market-card__body">
                  <header>
                    <div>
                      <h4>
                        {
                          item.title
                        }
                      </h4>

                      <span>
                        {
                          item.subtitle
                        }
                      </span>
                    </div>

                    <small>
                      {
                        item.listing.saleType
                      }
                    </small>
                  </header>

                  <dl>
                    <div>
                      <dt>
                        Price
                      </dt>

                      <dd>
                        {
                          item.listing
                            .price.amount
                        }
                        {" "}
                        {
                          item.listing
                            .price.currency
                        }
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Seller
                      </dt>

                      <dd>
                        {
                          item.listing
                            .seller.sellerId
                        }
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Asset
                      </dt>

                      <dd>
                        {
                          item.listing
                            .asset.assetId
                        }
                      </dd>
                    </div>
                  </dl>

                  <footer>
                    <span>
                      {
                        item.listing
                          .status
                      }
                    </span>

                    <button
                      type="button"
                      onClick={
                        (event) => {
                          event.stopPropagation();

                          setDetailListingId(
                            item.listing.id
                          );
                        }
                      }
                    >
                      View Asset
                    </button>
                  </footer>
                </div>
              </article>
            )
          )
        }
      </section>

      {
        result.total === 0 ? (
          <div className="ti-market-catalog__empty">
            No listed assets match the current filters.
          </div>
        ) : null
      }

      <footer className="ti-market-catalog__footer">
        <span>
          visible ≠ available on-chain
        </span>

        <span>
          listing ≠ ownership proof
        </span>

        <span>
          discovery ≠ settlement
        </span>

        <span>
          RPC:none
        </span>
      </footer>
    </section>
  );
}

export default NftMarketplaceCatalogWorkspace;
