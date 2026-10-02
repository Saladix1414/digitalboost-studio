import {
  useMemo,
  useState,
} from "react";

import {
  Binary,
  Blocks,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

import {
  nftDnaUnmintedFixture,
  nftDnaVerifiedFixture,
} from "./fixtures";

import {
  compareNftDna,
} from "./compare";

import type {
  NftDnaRecord,
} from "./types";

type DnaView =
  | "UNMINTED"
  | "VERIFIED";

function LayerCard({
  title,
  icon,
  children,
}: {
  readonly title: string;
  readonly icon:
    React.ReactNode;
  readonly children:
    React.ReactNode;
}) {
  return (
    <section className="ti-nft-dna__layer">
      <header>
        <span>
          {icon}
          {title}
        </span>

        <small>
          authority:none
        </small>
      </header>

      <div>
        {children}
      </div>
    </section>
  );
}

export function NftDnaWorkspace() {
  const [
    view,
    setView,
  ] =
    useState<DnaView>(
      "VERIFIED"
    );

  const dna:
    NftDnaRecord =
      view === "VERIFIED"
        ? nftDnaVerifiedFixture
        : nftDnaUnmintedFixture;

  const comparison =
    useMemo(
      () =>
        compareNftDna(
          nftDnaUnmintedFixture,
          nftDnaVerifiedFixture
        ),
      []
    );

  return (
    <section
      className="ti-nft-dna"
      data-dna-authority="none"
    >
      <header className="ti-nft-dna__hero">
        <div>
          <span className="ti-label">
            NFT DNA
          </span>

          <h3>
            Identity, Integrity & Blockchain Proof
          </h3>

          <p>
            Inspect the NFT domain identity,
            deterministic integrity evidence
            and verified mint proof without
            merging their authority boundaries.
          </p>
        </div>

        <Fingerprint
          size={24}
          strokeWidth={1.4}
        />
      </header>

      <div className="ti-nft-dna__controls">
        <button
          type="button"
          className={
            view === "UNMINTED"
              ? "is-active"
              : ""
          }
          onClick={() =>
            setView(
              "UNMINTED"
            )
          }
        >
          Unminted DNA
        </button>

        <button
          type="button"
          className={
            view === "VERIFIED"
              ? "is-active"
              : ""
          }
          onClick={() =>
            setView(
              "VERIFIED"
            )
          }
        >
          Verified DNA
        </button>
      </div>

      <div className="ti-nft-dna__summary">
        <div>
          <span>
            DNA Record
          </span>

          <strong>
            {dna.id}
          </strong>
        </div>

        <div>
          <span>
            Asset version
          </span>

          <strong>
            {
              dna.identity
                .assetVersion
            }
          </strong>
        </div>

        <div>
          <span>
            Collection version
          </span>

          <strong>
            {
              dna.identity
                .collectionVersion
            }
          </strong>
        </div>

        <div>
          <span>
            Blockchain proof
          </span>

          <strong>
            {dna.blockchainProof
              ? "AVAILABLE"
              : "ABSENT"}
          </strong>
        </div>
      </div>

      <div className="ti-nft-dna__layers">
        <LayerCard
          title="Identity"
          icon={
            <Fingerprint
              size={15}
            />
          }
        >
          <dl>
            <div>
              <dt>
                Asset
              </dt>
              <dd>
                {
                  dna.identity
                    .assetId
                }
              </dd>
            </div>

            <div>
              <dt>
                Collection
              </dt>
              <dd>
                {
                  dna.identity
                    .collectionId
                }
              </dd>
            </div>

            <div>
              <dt>
                Creator
              </dt>
              <dd>
                {
                  dna.identity
                    .creator
                }
              </dd>
            </div>

            <div>
              <dt>
                Created
              </dt>
              <dd>
                {
                  dna.identity
                    .createdAt
                }
              </dd>
            </div>
          </dl>
        </LayerCard>

        <LayerCard
          title="Integrity"
          icon={
            <Binary size={15} />
          }
        >
          <dl>
            <div>
              <dt>
                Media hash
              </dt>
              <dd>
                {
                  dna.integrity
                    .mediaHash
                }
              </dd>
            </div>

            <div>
              <dt>
                Metadata hash
              </dt>
              <dd>
                {
                  dna.integrity
                    .metadataHash
                }
              </dd>
            </div>

            <div>
              <dt>
                Forge config
              </dt>
              <dd>
                {
                  dna.integrity
                    .forgeConfigHash
                }
              </dd>
            </div>
          </dl>
        </LayerCard>

        <LayerCard
          title="Blockchain Proof"
          icon={
            <Blocks size={15} />
          }
        >
          {dna.blockchainProof ? (
            <dl>
              <div>
                <dt>
                  Chain
                </dt>
                <dd>
                  {
                    dna.blockchainProof
                      .chainId
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Contract
                </dt>
                <dd>
                  {
                    dna.blockchainProof
                      .contractAddress
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Token
                </dt>
                <dd>
                  {
                    dna.blockchainProof
                      .tokenId
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Owner
                </dt>
                <dd>
                  {
                    dna.blockchainProof
                      .owner
                  }
                </dd>
              </div>
            </dl>
          ) : (
            <div className="ti-nft-dna__proof-empty">
              <ShieldCheck
                size={17}
              />

              <span>
                No verified mint proof
                is attached.
              </span>
            </div>
          )}
        </LayerCard>
      </div>

      <section className="ti-nft-dna__changes">
        <header>
          <span className="ti-label">
            Change detection
          </span>

          <strong>
            {
              comparison
                .changes.length
            }{" "}
            detected
          </strong>
        </header>

        <div>
          {comparison.changes.map(
            (
              change,
              index
            ) => (
              <article
                key={
                  `${change.layer}-${change.field}-${index}`
                }
              >
                <span>
                  {change.layer}
                </span>

                <strong>
                  {change.field}
                </strong>

                <small>
                  {String(
                    change.before
                  )}{" "}
                  →{" "}
                  {String(
                    change.after
                  )}
                </small>
              </article>
            )
          )}
        </div>
      </section>

      <footer className="ti-nft-dna__footer">
        <span>
          identity ≠ proof
        </span>

        <span>
          hash ≠ ownership
        </span>

        <span>
          DNA ≠ provenance authority
        </span>

        <span>
          RPC:none
        </span>
      </footer>
    </section>
  );
}

export default NftDnaWorkspace;
