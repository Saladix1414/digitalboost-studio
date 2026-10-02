import {
  useMemo,
  useState,
} from "react";

import {
  Boxes,
  FileCheck2,
  FolderKanban,
  Gem,
  Layers3,
  Orbit,
  Plus,
  Sparkles,
  Waves,
} from "lucide-react";

import {
  nftAssetsFixture,
  nftCollectionsFixture,
  nftForgeActivityFixture,
} from "./fixtures";

import type {
  NftForgeSection,
} from "./types";

import NftMintWorkspace from "./mint/NftMintWorkspace";

import NftDnaWorkspace from "./dna/NftDnaWorkspace";

import NftOriginWorkspace from "./origin/NftOriginWorkspace";

import NftProvenanceWorkspace from "./provenance/NftProvenanceWorkspace";

import "./nft-forge.css";

const forgeSections: ReadonlyArray<{
  id: NftForgeSection;
  label: string;
  icon: typeof Plus;
}> = [
  { id: "create", label: "Create", icon: Plus },
  { id: "collections", label: "Collections", icon: FolderKanban },
  { id: "drafts", label: "Drafts", icon: Layers3 },
  { id: "assets", label: "Assets", icon: Gem },
  { id: "generative", label: "Generative", icon: Sparkles },
  { id: "living", label: "Living", icon: Waves },
  { id: "origin", label: "Origin", icon: Orbit },
  { id: "certificates", label: "Certificates", icon: FileCheck2 },
];

export function NftForgeWorkspace() {
  const [
    activeSection,
    setActiveSection,
  ] = useState<NftForgeSection>("create");

  const readyAssets = useMemo(
    () =>
      nftAssetsFixture.filter(
        (asset) => asset.status === "READY"
      ).length,
    []
  );

  const draftAssets = useMemo(
    () =>
      nftAssetsFixture.filter(
        (asset) => asset.status === "DRAFT"
      ).length,
    []
  );

  return (
    <div
      className="ti-nft-forge"
      data-nft-forge
      data-authority="none"
    >
      <header className="ti-nft-forge__hero">
        <div>
          <div className="ti-label">
            Digital Assets
          </div>

          <h2>NFT Forge</h2>

          <p>
            Build structured digital assets,
            collections and Forge configurations
            before blockchain execution exists.
          </p>
        </div>

        <div className="ti-nft-forge__environment">
          <span />
          Deterministic local environment
        </div>
      </header>

      <section
        className="ti-nft-forge__metrics"
        aria-label="NFT Forge summary"
      >
        <article>
          <span>Collections</span>
          <strong>
            {nftCollectionsFixture.length}
          </strong>
          <small>
            Local structured fixtures
          </small>
        </article>

        <article>
          <span>Assets</span>
          <strong>
            {nftAssetsFixture.length}
          </strong>
          <small>
            {readyAssets} ready
          </small>
        </article>

        <article>
          <span>Drafts</span>
          <strong>
            {draftAssets}
          </strong>
          <small>
            Not mintable authority
          </small>
        </article>

        <article>
          <span>Blockchain</span>
          <strong>Offline</strong>
          <small>
            No RPC configured
          </small>
        </article>
      </section>

      <nav
        className="ti-nft-forge__nav"
        aria-label="NFT Forge sections"
      >
        {forgeSections.map(
          ({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={
                activeSection === id
                  ? "page"
                  : undefined
              }
              className={
                activeSection === id
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setActiveSection(id)
              }
            >
              <Icon
                size={15}
                strokeWidth={1.7}
              />
              {label}
            </button>
          )
        )}
      </nav>

      {activeSection === "create" ? (
        <section className="ti-nft-forge__create">
          <div className="ti-nft-forge__primary-panel">
            <div className="ti-nft-forge__panel-head">
              <div>
                <span className="ti-label">
                  Asset Composer
                </span>

                <h3>
                  Create a digital asset
                </h3>
              </div>

              <Boxes
                size={20}
                strokeWidth={1.5}
              />
            </div>

            <div className="ti-nft-forge__dropzone">
              <Sparkles
                size={24}
                strokeWidth={1.4}
              />

              <strong>
                Asset preparation surface
              </strong>

              <span>
                Media ingestion becomes
                functional in a later
                storage phase.
              </span>

              <button
                type="button"
                disabled
              >
                Add media
              </button>
            </div>
          </div>

          <aside className="ti-nft-forge__side-panel">
            <span className="ti-label">
              Forge configuration
            </span>

            <h3>
              Draft properties
            </h3>

            <dl>
              <div>
                <dt>Mode</dt>
                <dd>Classic</dd>
              </div>

              <div>
                <dt>Network</dt>
                <dd>Not configured</dd>
              </div>

              <div>
                <dt>Mint state</dt>
                <dd>Unavailable</dd>
              </div>

              <div>
                <dt>Authority</dt>
                <dd>None</dd>
              </div>
            </dl>
          </aside>
        </section>
      ) : null}

      {activeSection === "collections" ? (
        <section className="ti-nft-forge__list">
          <div className="ti-nft-forge__section-head">
            <div>
              <span className="ti-label">
                Collections
              </span>

              <h3>
                Collection structures
              </h3>
            </div>

            <button
              type="button"
              disabled
            >
              <Plus size={14} />
              New collection
            </button>
          </div>

          {nftCollectionsFixture.map(
            (collection) => (
              <article
                key={collection.id}
                className="ti-nft-forge__row"
              >
                <div>
                  <strong>
                    {collection.name}
                  </strong>

                  <span>
                    {collection.symbol}
                    {" · "}
                    v{collection.version}
                  </span>
                </div>

                <div>
                  <strong>
                    {collection.assetIds.length}
                  </strong>
                  <span>assets</span>
                </div>

                <div>
                  <strong>
                    {collection.status}
                  </strong>
                  <span>
                    deterministic
                  </span>
                </div>
              </article>
            )
          )}
        </section>
      ) : null}

      {activeSection === "drafts" ||
      activeSection === "assets" ? (
        <section className="ti-nft-forge__list">
          <div className="ti-nft-forge__section-head">
            <div>
              <span className="ti-label">
                {activeSection}
              </span>

              <h3>
                Digital asset inventory
              </h3>
            </div>
          </div>

          {nftAssetsFixture
            .filter((asset) =>
              activeSection === "drafts"
                ? asset.status === "DRAFT"
                : true
            )
            .map((asset) => (
              <article
                key={asset.id}
                className="ti-nft-forge__row"
              >
                <div>
                  <strong>
                    {asset.title}
                  </strong>
                  <span>
                    {asset.creator}
                  </span>
                </div>

                <div>
                  <strong>
                    {asset.mediaKind}
                  </strong>
                  <span>
                    media type
                  </span>
                </div>

                <div>
                  <strong>
                    {asset.status}
                  </strong>
                  <span>
                    {asset.traits.length} traits
                  </span>
                </div>
              </article>
            ))}
        </section>
      ) : null}

      {activeSection === "create" ? (
        <NftMintWorkspace />
      ) : null}

      {activeSection === "origin" ? (
        <>
          <NftOriginWorkspace />
          <NftDnaWorkspace />
          <NftProvenanceWorkspace />
        </>
      ) : null}

      {[
        "generative",
        "living",
        "certificates",
      ].includes(activeSection) ? (
        <section className="ti-nft-forge__future">
          <div>
            <span className="ti-label">
              {activeSection}
            </span>

            <h3>
              Foundation prepared
            </h3>

            <p>
              This surface is intentionally
              non-authoritative and contains
              no blockchain execution.
            </p>
          </div>
        </section>
      ) : null}

      <footer className="ti-nft-forge__activity">
        <span>
          {nftForgeActivityFixture.length} deterministic events
        </span>

        <span>
          authoritative:false
        </span>

        <span>
          blockchain:none
        </span>
      </footer>
    </div>
  );
}

export default NftForgeWorkspace;
