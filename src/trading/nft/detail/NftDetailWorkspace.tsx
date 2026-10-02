import {
  ArrowLeft,
  BadgeDollarSign,
  Fingerprint,
  Layers3,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type {
  NftAssetDetail,
} from "./types";

import {
  validateNftAssetDetail,
} from "./validation";

import {
  composeNftDetailEvidence,
} from "./evidence";

import {
  evaluateNftDetailConsistency,
} from "./consistency";

export type NftDetailWorkspaceProps = {
  readonly detail:
    NftAssetDetail;

  readonly onBack:
    () => void;
};

export function NftDetailWorkspace({
  detail,
  onBack,
}: NftDetailWorkspaceProps) {
  const validation =
    validateNftAssetDetail(
      detail
    );

  const evidence =
    composeNftDetailEvidence(
      detail
    );

  const consistency =
    evaluateNftDetailConsistency(
      detail
    );

  return (
    <section
      className="ti-nft-detail"
      data-nft-detail-workspace
      data-authority="none"
    >
      <header className="ti-nft-detail__hero">
        <button
          type="button"
          onClick={onBack}
          className="ti-nft-detail__back"
        >
          <ArrowLeft
            size={14}
          />

          Back to Marketplace
        </button>

        <div className="ti-nft-detail__hero-main">
          <div>
            <span className="ti-label">
              NFT Detail
            </span>

            <h3>
              {detail.title}
            </h3>

            <p>
              {detail.subtitle}
            </p>
          </div>

          <span className="ti-nft-detail__status">
            {
              validation.valid
                ? "VALID"
                : "INVALID"
            }
          </span>
        </div>
      </header>

      <section className="ti-nft-detail__media">
        <div>
          {
            detail.featured
              ? "FEATURED DIGITAL ASSET"
              : "DIGITAL ASSET"
          }
        </div>
      </section>

      <section className="ti-nft-detail__metrics">
        <article>
          <span>
            Listing
          </span>

          <strong>
            {detail.market.status}
          </strong>
        </article>

        <article>
          <span>
            Price
          </span>

          <strong>
            {detail.market.priceAmount}
            {" "}
            {detail.market.currency}
          </strong>
        </article>

        <article>
          <span>
            Sale type
          </span>

          <strong>
            {detail.market.saleType}
          </strong>
        </article>

        <article>
          <span>
            Validation
          </span>

          <strong>
            {
              validation.valid
                ? "PASS"
                : "FAIL"
            }
          </strong>
        </article>
      </section>

      <div className="ti-nft-detail__grid">
        <section className="ti-nft-detail__panel">
          <header>
            <Fingerprint
              size={15}
            />

            <span>
              Identity
            </span>
          </header>

          <dl>
            <div>
              <dt>
                Asset
              </dt>

              <dd>
                {detail.identity.assetId}
              </dd>
            </div>

            <div>
              <dt>
                Collection
              </dt>

              <dd>
                {detail.identity.collectionId}
              </dd>
            </div>

            <div>
              <dt>
                Creator ref
              </dt>

              <dd>
                {detail.identity.creatorRef}
              </dd>
            </div>
          </dl>
        </section>

        <section className="ti-nft-detail__panel">
          <header>
            <ShieldCheck
              size={15}
            />

            <span>
              Integrity
            </span>
          </header>

          <dl>
            <div>
              <dt>
                DNA
              </dt>

              <dd>
                {
                  detail.integrity.dnaId ??
                  "none"
                }
              </dd>
            </div>

            <div>
              <dt>
                Provenance
              </dt>

              <dd>
                {
                  detail.integrity.provenanceId ??
                  "none"
                }
              </dd>
            </div>

            <div>
              <dt>
                Origin
              </dt>

              <dd>
                {
                  detail.integrity.originId ??
                  "not composed yet"
                }
              </dd>
            </div>
          </dl>
        </section>

        <section className="ti-nft-detail__panel">
          <header>
            <UserRound
              size={15}
            />

            <span>
              Seller
            </span>
          </header>

          <dl>
            <div>
              <dt>
                Seller
              </dt>

              <dd>
                {detail.market.sellerId}
              </dd>
            </div>

            <div>
              <dt>
                Wallet ref
              </dt>

              <dd>
                {
                  detail.market.walletRef ??
                  "none"
                }
              </dd>
            </div>

            <div>
              <dt>
                Listing
              </dt>

              <dd>
                {detail.market.listingId}
              </dd>
            </div>
          </dl>
        </section>

        <section className="ti-nft-detail__panel">
          <header>
            <BadgeDollarSign
              size={15}
            />

            <span>
              Market Context
            </span>
          </header>

          <dl>
            <div>
              <dt>
                Amount
              </dt>

              <dd>
                {detail.market.priceAmount}
              </dd>
            </div>

            <div>
              <dt>
                Currency
              </dt>

              <dd>
                {detail.market.currency}
              </dd>
            </div>

            <div>
              <dt>
                Sale type
              </dt>

              <dd>
                {detail.market.saleType}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="ti-nft-detail__evidence">
        <header>
          <div>
            <span className="ti-label">
              Evidence Composition
            </span>

            <strong>
              {
                evidence.present
              }
              /
              {
                evidence.total
              }
              {" "}
              present
            </strong>
          </div>

          <span>
            {
              evidence.complete
                ? "COMPLETE"
                : "PARTIAL"
            }
          </span>
        </header>

        <div className="ti-nft-detail__evidence-grid">
          {
            evidence.items.map(
              (item) => (
                <article
                  key={item.id}
                >
                  <span>
                    {item.kind}
                  </span>

                  <strong>
                    {item.label}
                  </strong>

                  <small>
                    {item.reference || "none"}
                  </small>

                  <em>
                    {item.status}
                  </em>
                </article>
              )
            )
          }
        </div>
      </section>

      <section className="ti-nft-detail__consistency">
        <header>
          <span className="ti-label">
            Cross-domain Consistency
          </span>
        </header>

        <div>
          <span>
            Asset match
          </span>

          <strong>
            {
              consistency.assetMatch
                ? "PASS"
                : "FAIL"
            }
          </strong>
        </div>

        <div>
          <span>
            Collection match
          </span>

          <strong>
            {
              consistency.collectionMatch
                ? "PASS"
                : "FAIL"
            }
          </strong>
        </div>

        <div>
          <span>
            Provenance closure
          </span>

          <strong>
            {
              consistency.provenanceClosureValid
                ? "PASS"
                : "FAIL"
            }
          </strong>
        </div>
      </section>

      <section className="ti-nft-detail__actions">
        <button
          type="button"
          disabled
          title="Transaction execution is reserved for later phases"
        >
          Buy Asset
        </button>

        <button
          type="button"
          disabled
          title="Blockchain execution is not active in Phase 28"
        >
          Verify On-chain
        </button>
      </section>

      <div className="ti-nft-detail__boundary">
        <Layers3
          size={15}
        />

        <span>
          Detail composition exposes local evidence and marketplace context only.
          It does not prove ownership, payment, legal title or blockchain finality.
        </span>
      </div>

      <footer className="ti-nft-detail__footer">
        <span>
          detail ≠ ownership
        </span>

        <span>
          seller ref ≠ seller authority
        </span>

        <span>
          price ≠ payment
        </span>

        <span>
          provenance ≠ absolute truth
        </span>

        <span>
          RPC:none
        </span>
      </footer>
    </section>
  );
}

export default NftDetailWorkspace;
