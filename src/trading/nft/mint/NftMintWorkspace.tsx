import {
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  CircleDollarSign,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import {
  createNftMintRecord,
} from "./factory";

import {
  confirmAndVerifyNftMint,
  markNftMintReady,
  prepareNftMint,
  submitNftMintEvidence,
} from "./engine";

import {
  nftAssetsFixture,
  nftCollectionsFixture,
} from "../fixtures";

import type {
  NftMintMode,
  NftMintRecord,
  NftMintTransactionEvidence,
} from "./types";

function deterministicEvidence(
  record: NftMintRecord
): NftMintTransactionEvidence {
  return {
    chainId: "deterministic-1",
    contractAddress:
      "contract-local-001",
    transactionHash:
      `tx-${record.intent.id}`,
    blockNumber: 100,
    receiptStatus: "SUCCESS",
    tokenId:
      record.intent.assetId
        .replace(
          /[^0-9]/g,
          ""
        ) || "1",
    owner:
      record.intent.expectedOwner,
    metadataRef:
      record.intent.expectedMetadataRef,
    mintEventFound: true,
    authoritative: false,
  };
}

export function NftMintWorkspace() {
  const readyAssets =
    useMemo(
      () =>
        nftAssetsFixture.filter(
          (asset) =>
            asset.status === "READY"
        ),
      []
    );

  const [
    selectedAssetId,
    setSelectedAssetId,
  ] = useState(
    readyAssets[0]?.id ?? ""
  );

  const [
    mode,
    setMode,
  ] =
    useState<NftMintMode>(
      "BASIC"
    );

  const [
    record,
    setRecord,
  ] =
    useState<NftMintRecord | null>(
      null
    );

  const selectedAsset =
    readyAssets.find(
      (asset) =>
        asset.id ===
        selectedAssetId
    );

  const selectedCollection =
    nftCollectionsFixture.find(
      (collection) =>
        collection.id ===
        selectedAsset?.collectionId
    );

  function createIntent() {
    if (
      !selectedAsset ||
      !selectedCollection
    ) {
      return;
    }

    const created =
      createNftMintRecord({
        id:
          `mint-${selectedAsset.id}-${mode.toLowerCase()}`,
        assetId:
          selectedAsset.id,
        collectionId:
          selectedCollection.id,
        mode,
        expectedOwner:
          "owner-local-001",
        expectedMetadataRef:
          `metadata://${selectedAsset.id}`,
        requestedAt:
          "2026-10-02T12:00:00.000Z",
      });

    const ready =
      markNftMintReady(
        created,
        nftAssetsFixture,
        nftCollectionsFixture,
        "2026-10-02T12:01:00.000Z"
      );

    setRecord(ready);
  }

  function prepare() {
    if (!record) {
      return;
    }

    setRecord(
      prepareNftMint(
        record,
        "2026-10-02T12:02:00.000Z"
      )
    );
  }

  function submit() {
    if (!record) {
      return;
    }

    setRecord(
      submitNftMintEvidence(
        record,
        deterministicEvidence(
          record
        ),
        "2026-10-02T12:03:00.000Z"
      )
    );
  }

  function verify() {
    if (!record) {
      return;
    }

    setRecord(
      confirmAndVerifyNftMint(
        record,
        "2026-10-02T12:04:00.000Z"
      )
    );
  }

  return (
    <section
      className="ti-nft-mint"
      data-mint-authority="verification-required"
    >
      <header className="ti-nft-mint__head">
        <div>
          <span className="ti-label">
            Minting
          </span>

          <h3>
            Deterministic Mint Lab
          </h3>

          <p>
            Prepare and verify mint evidence
            without RPC, wallet signing or
            blockchain execution.
          </p>
        </div>

        <ShieldCheck
          size={22}
          strokeWidth={1.5}
        />
      </header>

      <div className="ti-nft-mint__grid">
        <div className="ti-nft-mint__panel">
          <span className="ti-label">
            Asset
          </span>

          <select
            value={selectedAssetId}
            onChange={(event) => {
              setSelectedAssetId(
                event.target.value
              );
              setRecord(null);
            }}
          >
            {readyAssets.map(
              (asset) => (
                <option
                  key={asset.id}
                  value={asset.id}
                >
                  {asset.title}
                </option>
              )
            )}
          </select>

          <span className="ti-label">
            Mint mode
          </span>

          <div className="ti-nft-mint__modes">
            <button
              type="button"
              className={
                mode === "BASIC"
                  ? "is-active"
                  : ""
              }
              onClick={() => {
                setMode("BASIC");
                setRecord(null);
              }}
            >
              <CircleDollarSign
                size={15}
              />
              Basic
            </button>

            <button
              type="button"
              className={
                mode ===
                "MINT_ON_SALE"
                  ? "is-active"
                  : ""
              }
              onClick={() => {
                setMode(
                  "MINT_ON_SALE"
                );
                setRecord(null);
              }}
            >
              <Sparkles size={15} />
              Mint-on-sale
            </button>
          </div>

          <dl>
            <div>
              <dt>
                Collection
              </dt>
              <dd>
                {
                  selectedCollection
                    ?.name ??
                  "Unavailable"
                }
              </dd>
            </div>

            <div>
              <dt>
                DBX intent
              </dt>
              <dd>
                {mode === "BASIC"
                  ? "150 DBX"
                  : "0 DBX upfront"}
              </dd>
            </div>

            <div>
              <dt>
                Gas
              </dt>
              <dd>
                External / deferred
              </dd>
            </div>

            <div>
              <dt>
                Chain
              </dt>
              <dd>
                Deterministic
              </dd>
            </div>
          </dl>

          {!record ? (
            <button
              type="button"
              className="ti-nft-mint__primary"
              onClick={createIntent}
            >
              Create mint intent
            </button>
          ) : null}
        </div>

        <div className="ti-nft-mint__panel">
          <span className="ti-label">
            Lifecycle
          </span>

          {!record ? (
            <div className="ti-nft-mint__empty">
              Select an asset and create a
              mint intent.
            </div>
          ) : (
            <>
              <div className="ti-nft-mint__status">
                <strong>
                  {record.status}
                </strong>

                {record.status ===
                "VERIFIED" ? (
                  <CheckCircle2
                    size={18}
                  />
                ) : record.status ===
                  "FAILED" ? (
                  <XCircle
                    size={18}
                  />
                ) : (
                  <LoaderCircle
                    size={18}
                  />
                )}
              </div>

              <div className="ti-nft-mint__steps">
                <span>
                  Intent created
                </span>

                <span>
                  Validation complete
                </span>

                <span>
                  {record.prepared
                    ? "Prepared"
                    : "Preparation pending"}
                </span>

                <span>
                  {record.evidence
                    ? "Evidence submitted"
                    : "Submission pending"}
                </span>

                <span>
                  {record.verification
                    ?.verified
                    ? "Verified"
                    : "Verification pending"}
                </span>
              </div>

              {record.status ===
              "READY" ? (
                <button
                  type="button"
                  className="ti-nft-mint__primary"
                  onClick={prepare}
                >
                  Prepare mint
                </button>
              ) : null}

              {record.status ===
              "AWAITING_SIGNATURE" ? (
                <button
                  type="button"
                  className="ti-nft-mint__primary"
                  onClick={submit}
                >
                  Simulate submission
                </button>
              ) : null}

              {record.status ===
              "SUBMITTED" ? (
                <button
                  type="button"
                  className="ti-nft-mint__primary"
                  onClick={verify}
                >
                  Verify mint evidence
                </button>
              ) : null}

              {record.status ===
              "VERIFIED" ? (
                <div className="ti-nft-mint__verified">
                  Mint verified from complete
                  deterministic evidence.
                </div>
              ) : null}

              {record.status ===
              "FAILED" ? (
                <div className="ti-nft-mint__failed">
                  Mint verification failed.
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <footer className="ti-nft-mint__footer">
        <span>
          submitted ≠ verified
        </span>

        <span>
          txHash ≠ authority
        </span>

        <span>
          DBX settlement:none
        </span>

        <span>
          RPC:none
        </span>
      </footer>
    </section>
  );
}

export default NftMintWorkspace;
