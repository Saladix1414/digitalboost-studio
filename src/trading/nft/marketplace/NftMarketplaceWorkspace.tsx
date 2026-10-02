import {
  useMemo,
} from "react";

import {
  BadgeDollarSign,
  CheckCircle2,
  CircleDollarSign,
  ShoppingCart,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  evaluateFixtureMarketplaceEligibility,
} from "./eligibilityBridge";

import {
  createMarketplaceSaleIntent,
} from "./saleIntent";

import {
  matchMarketplaceOrder,
} from "./orderMatch";

import {
  createMarketplacePreSettlement,
} from "./preSettlement";

import {
  nftMarketplaceListedFixture,
  nftMarketplaceOrderFixture,
} from "./orderFixtures";

import {
  nftMarketplaceReadyListingFixture,
} from "./eligibilityFixtures";

export function NftMarketplaceWorkspace() {
  const eligibility =
    useMemo(
      () =>
        evaluateFixtureMarketplaceEligibility(
          nftMarketplaceReadyListingFixture
        ),
      []
    );

  const saleIntent =
    useMemo(
      () =>
        createMarketplaceSaleIntent(
          nftMarketplaceReadyListingFixture,
          eligibility,
          "2026-10-14T10:06:00.000Z"
        ),
      [eligibility]
    );

  const matchedOrder =
    useMemo(
      () =>
        matchMarketplaceOrder(
          nftMarketplaceOrderFixture,
          nftMarketplaceListedFixture,
          "2026-10-14T10:13:00.000Z"
        ),
      []
    );

  const preSettlement =
    useMemo(
      () =>
        createMarketplacePreSettlement(
          matchedOrder,
          "2026-10-14T10:14:00.000Z"
        ),
      [matchedOrder]
    );

  return (
    <section
      className="ti-marketplace"
      data-marketplace-workspace
      data-authority="none"
    >
      <header className="ti-marketplace__hero">
        <div>
          <span className="ti-label">
            Marketplace
          </span>

          <h3>
            Listing, Order Intent & Pre-settlement
          </h3>

          <p>
            Inspect marketplace readiness,
            listing eligibility, buyer/seller
            matching and pre-settlement state
            without wallet signing or blockchain
            execution.
          </p>
        </div>

        <ShoppingCart
          size={24}
          strokeWidth={1.4}
        />
      </header>

      <section className="ti-marketplace__metrics">
        <article>
          <span>
            Listing
          </span>

          <strong>
            {
              nftMarketplaceReadyListingFixture
                .status
            }
          </strong>

          <small>
            local domain state
          </small>
        </article>

        <article>
          <span>
            Eligibility
          </span>

          <strong>
            {eligibility.eligible
              ? "PASS"
              : "FAIL"}
          </strong>

          <small>
            authoritative:false
          </small>
        </article>

        <article>
          <span>
            Order
          </span>

          <strong>
            {matchedOrder.status}
          </strong>

          <small>
            buyer/seller matched
          </small>
        </article>

        <article>
          <span>
            Settlement
          </span>

          <strong>
            PREPARED
          </strong>

          <small>
            execution:none
          </small>
        </article>
      </section>

      <div className="ti-marketplace__grid">
        <section className="ti-marketplace__panel">
          <header>
            <span>
              <BadgeDollarSign
                size={15}
              />
              Listing
            </span>

            <small>
              v
              {
                nftMarketplaceReadyListingFixture
                  .version
              }
            </small>
          </header>

          <dl>
            <div>
              <dt>
                Asset
              </dt>

              <dd>
                {
                  nftMarketplaceReadyListingFixture
                    .asset.assetId
                }
              </dd>
            </div>

            <div>
              <dt>
                Collection
              </dt>

              <dd>
                {
                  nftMarketplaceReadyListingFixture
                    .asset.collectionId
                }
              </dd>
            </div>

            <div>
              <dt>
                Sale type
              </dt>

              <dd>
                {
                  nftMarketplaceReadyListingFixture
                    .saleType
                }
              </dd>
            </div>

            <div>
              <dt>
                Price
              </dt>

              <dd>
                {
                  nftMarketplaceReadyListingFixture
                    .price.amount
                }
                {" "}
                {
                  nftMarketplaceReadyListingFixture
                    .price.currency
                }
              </dd>
            </div>

            <div>
              <dt>
                Provenance
              </dt>

              <dd>
                {
                  nftMarketplaceReadyListingFixture
                    .asset.provenanceId
                }
              </dd>
            </div>
          </dl>
        </section>

        <section className="ti-marketplace__panel">
          <header>
            <span>
              <UserRound
                size={15}
              />
              Participants
            </span>

            <small>
              identity refs only
            </small>
          </header>

          <dl>
            <div>
              <dt>
                Seller
              </dt>

              <dd>
                {
                  nftMarketplaceReadyListingFixture
                    .seller.sellerId
                }
              </dd>
            </div>

            <div>
              <dt>
                Seller wallet
              </dt>

              <dd>
                {
                  nftMarketplaceReadyListingFixture
                    .seller.walletRef
                }
              </dd>
            </div>

            <div>
              <dt>
                Buyer
              </dt>

              <dd>
                {
                  matchedOrder
                    .buyer.buyerId
                }
              </dd>
            </div>

            <div>
              <dt>
                Buyer wallet
              </dt>

              <dd>
                {
                  matchedOrder
                    .buyer.walletRef
                }
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="ti-marketplace__flow">
        <header>
          <span className="ti-label">
            Marketplace flow
          </span>

          <strong>
            LOCAL ONLY
          </strong>
        </header>

        <div className="ti-marketplace__flow-grid">
          <div>
            <span>
              Eligibility
            </span>

            <strong>
              {eligibility.eligible
                ? "ELIGIBLE"
                : "BLOCKED"}
            </strong>
          </div>

          <div>
            <span>
              Sale intent
            </span>

            <strong>
              {
                saleIntent
                  .saleType
              }
            </strong>
          </div>

          <div>
            <span>
              Match
            </span>

            <strong>
              {matchedOrder.status}
            </strong>
          </div>

          <div>
            <span>
              Pre-settlement
            </span>

            <strong>
              {preSettlement.ready
                ? "READY"
                : "BLOCKED"}
            </strong>
          </div>
        </div>

        {eligibility.eligible &&
        preSettlement.ready ? (
          <div className="ti-marketplace__pass">
            <CheckCircle2
              size={16}
            />

            <span>
              Listing, buyer/seller match and
              pre-settlement are internally
              coherent.
            </span>
          </div>
        ) : null}
      </section>

      <section className="ti-marketplace__intent">
        <header>
          <span>
            <CircleDollarSign
              size={15}
            />
            Sale Intent
          </span>

          <small>
            non-executable
          </small>
        </header>

        <dl>
          <div>
            <dt>
              Listing
            </dt>

            <dd>
              {saleIntent.listingId}
            </dd>
          </div>

          <div>
            <dt>
              Asset
            </dt>

            <dd>
              {saleIntent.assetId}
            </dd>
          </div>

          <div>
            <dt>
              Seller
            </dt>

            <dd>
              {saleIntent.sellerId}
            </dd>
          </div>

          <div>
            <dt>
              Amount
            </dt>

            <dd>
              {
                saleIntent.price.amount
              }
              {" "}
              {
                saleIntent.price.currency
              }
            </dd>
          </div>
        </dl>
      </section>

      <div className="ti-marketplace__boundary">
        <ShieldCheck
          size={15}
        />

        <span>
          Marketplace readiness and
          pre-settlement do not prove payment,
          ownership transfer, wallet approval or
          blockchain settlement.
        </span>
      </div>

      <footer className="ti-marketplace__footer">
        <span>
          eligibility ≠ ownership
        </span>

        <span>
          matched ≠ paid
        </span>

        <span>
          pre-settlement ≠ settlement
        </span>

        <span>
          wallet signing:none
        </span>

        <span>
          RPC:none
        </span>
      </footer>
    </section>
  );
}

export default NftMarketplaceWorkspace;
