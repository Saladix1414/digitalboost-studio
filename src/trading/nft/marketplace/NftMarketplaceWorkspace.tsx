import {
  useMemo,
} from "react";

import {
  Activity,
  BadgeDollarSign,
  CheckCircle2,
  CircleDollarSign,
  Route,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import NftMarketplaceCatalogWorkspace from "./catalog/NftMarketplaceCatalogWorkspace";

import {
  runMarketplaceEngine,
} from "./orchestration/engine";

import {
  runObservableMarketplaceEngine,
} from "./orchestration/observableEngine";

import {
  nftMarketplaceEngineInputFixture,
} from "./orchestration/fixtures";

export function NftMarketplaceWorkspace() {
  const engine =
    useMemo(
      () =>
        runMarketplaceEngine(
          nftMarketplaceEngineInputFixture
        ),
      []
    );

  const observable =
    useMemo(
      () =>
        runObservableMarketplaceEngine(
          nftMarketplaceEngineInputFixture
        ),
      []
    );

  return (
    <section
      className="ti-marketplace"
      data-marketplace-workspace
      data-marketplace-engine
      data-authority="none"
    >
      <header className="ti-marketplace__hero">
        <div>
          <span className="ti-label">
            Marketplace Engine
          </span>

          <h3>
            Discovery, Intent & Pre-settlement
          </h3>

          <p>
            Inspect the deterministic marketplace
            lifecycle from eligibility through
            pre-settlement without payment,
            wallet signing or blockchain
            execution.
          </p>
        </div>

        <ShoppingCart
          size={24}
          strokeWidth={1.4}
        />
      </header>

      <NftMarketplaceCatalogWorkspace />

      <section className="ti-marketplace__metrics">
        <article>
          <span>
            Listing
          </span>

          <strong>
            {engine.listing.status}
          </strong>

          <small>
            orchestrated state
          </small>
        </article>

        <article>
          <span>
            Eligibility
          </span>

          <strong>
            {
              engine.eligibility
                .eligible
                ? "PASS"
                : "FAIL"
            }
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
            {engine.order.status}
          </strong>

          <small>
            matched ≠ paid
          </small>
        </article>

        <article>
          <span>
            Engine stage
          </span>

          <strong>
            {engine.stage}
          </strong>

          <small>
            execution:{engine.execution}
          </small>
        </article>
      </section>

      <section className="ti-marketplace__engine-status">
        <header>
          <span>
            <Route
              size={15}
            />
            Engine Lifecycle
          </span>

          <strong>
            {observable.lifecycle.status}
          </strong>
        </header>

        <div className="ti-marketplace__engine-steps">
          {
            observable.lifecycle.events.map(
              (event) => (
                <article
                  key={
                    `${event.sequence}:${event.to}`
                  }
                >
                  <span>
                    #{event.sequence}
                  </span>

                  <strong>
                    {event.to}
                  </strong>

                  <small>
                    {event.reason}
                  </small>
                </article>
              )
            )
          }
        </div>
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
              v{engine.listing.version}
            </small>
          </header>

          <dl>
            <div>
              <dt>
                Asset
              </dt>

              <dd>
                {
                  engine.listing
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
                  engine.listing
                    .asset.collectionId
                }
              </dd>
            </div>

            <div>
              <dt>
                Provenance
              </dt>

              <dd>
                {
                  engine.listing
                    .asset.provenanceId
                }
              </dd>
            </div>

            <div>
              <dt>
                Price
              </dt>

              <dd>
                {
                  engine.listing
                    .price.amount
                }
                {" "}
                {
                  engine.listing
                    .price.currency
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
                  engine.listing
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
                  engine.listing
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
                  engine.order
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
                  engine.order
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
            Marketplace Engine Flow
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
              {
                engine.eligibility
                  .eligible
                  ? "ELIGIBLE"
                  : "BLOCKED"
              }
            </strong>
          </div>

          <div>
            <span>
              Sale intent
            </span>

            <strong>
              {
                engine.saleIntent
                  .saleType
              }
            </strong>
          </div>

          <div>
            <span>
              Match
            </span>

            <strong>
              {engine.order.status}
            </strong>
          </div>

          <div>
            <span>
              Pre-settlement
            </span>

            <strong>
              {
                engine.preSettlement
                  .ready
                  ? "READY"
                  : "BLOCKED"
              }
            </strong>
          </div>
        </div>

        {
          engine.eligibility.eligible &&
          engine.preSettlement.ready
            ? (
              <div className="ti-marketplace__pass">
                <CheckCircle2
                  size={16}
                />

                <span>
                  Marketplace Engine completed
                  deterministic pre-settlement.
                </span>
              </div>
            )
            : null
        }
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
              {
                engine.saleIntent
                  .listingId
              }
            </dd>
          </div>

          <div>
            <dt>
              Asset
            </dt>

            <dd>
              {
                engine.saleIntent
                  .assetId
              }
            </dd>
          </div>

          <div>
            <dt>
              Seller
            </dt>

            <dd>
              {
                engine.saleIntent
                  .sellerId
              }
            </dd>
          </div>

          <div>
            <dt>
              Amount
            </dt>

            <dd>
              {
                engine.saleIntent
                  .price.amount
              }
              {" "}
              {
                engine.saleIntent
                  .price.currency
              }
            </dd>
          </div>
        </dl>
      </section>

      <section className="ti-marketplace__trace">
        <header>
          <span>
            <Activity
              size={15}
            />
            Deterministic Trace
          </span>

          <strong>
            {
              observable.observability
                .failed
                ? "FAILED"
                : "PASS"
            }
          </strong>
        </header>

        <div className="ti-marketplace__trace-list">
          {
            observable.observability
              .trace.map(
                (entry) => (
                  <article
                    key={
                      `${entry.sequence}:${entry.code}`
                    }
                  >
                    <span>
                      #{entry.sequence}
                    </span>

                    <div>
                      <strong>
                        {entry.code}
                      </strong>

                      <small>
                        {entry.message}
                      </small>
                    </div>

                    <em>
                      {entry.kind}
                    </em>
                  </article>
                )
              )
          }
        </div>
      </section>

      <div className="ti-marketplace__boundary">
        <ShieldCheck
          size={15}
        />

        <span>
          PRE_SETTLEMENT_READY is an internal
          marketplace state. It does not prove
          payment, ownership transfer, wallet
          approval or blockchain settlement.
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
          telemetry ≠ authority
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
