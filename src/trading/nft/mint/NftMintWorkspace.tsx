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
  TriangleAlert,
  XCircle,
} from "lucide-react";

import {
  createNftMintRecord,
} from "./factory";

import {
  markNftMintReady,
  prepareNftMint,
  submitNftMintEvidence,
} from "./engine";

import {
  createEmptyMintEvidenceRegistry,
} from "./evidenceRegistryFactory";

import {
  verifyNftMintWithReplayProtection,
} from "./hardenedVerification";

import {
  nftAssetsFixture,
  nftCollectionsFixture,
} from "../fixtures";

import type {
  NftMintEvidenceRegistry,
  NftMintMode,
  NftMintRecord,
  NftMintTransactionEvidence,
} from "./types";

type FailureMode =
  | "NONE"
  | "FAILED_RECEIPT"
  | "MISSING_EVENT"
  | "OWNER_MISMATCH"
  | "METADATA_MISMATCH";

function deterministicEvidence(
  record: NftMintRecord,
  failureMode: FailureMode
): NftMintTransactionEvidence {
  const base:
    NftMintTransactionEvidence = {
    chainId:
      "deterministic-1",

    contractAddress:
      "contract-local-001",

    transactionHash:
      `tx-${record.intent.id}`,

    blockNumber:
      100,

    receiptStatus:
      "SUCCESS",

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

    mintEventFound:
      true,

    authoritative:
      false,
  };

  if (
    failureMode ===
    "FAILED_RECEIPT"
  ) {
    return {
      ...base,
      receiptStatus:
        "FAILED",
    };
  }

  if (
    failureMode ===
    "MISSING_EVENT"
  ) {
    return {
      ...base,
      mintEventFound:
        false,
    };
  }

  if (
    failureMode ===
    "OWNER_MISMATCH"
  ) {
    return {
      ...base,
      owner:
        "unexpected-owner",
    };
  }

  if (
    failureMode ===
    "METADATA_MISMATCH"
  ) {
    return {
      ...base,
      metadataRef:
        "metadata://unexpected",
    };
  }

  return base;
}

export function NftMintWorkspace() {
  const readyAssets =
    useMemo(
      () =>
        nftAssetsFixture.filter(
          (asset) =>
            asset.status ===
            "READY"
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
    failureMode,
    setFailureMode,
  ] =
    useState<FailureMode>(
      "NONE"
    );

  const [
    record,
    setRecord,
  ] =
    useState<NftMintRecord | null>(
      null
    );

  const [
    registry,
    setRegistry,
  ] =
    useState<NftMintEvidenceRegistry>(
      () =>
        createEmptyMintEvidenceRegistry()
    );

  const [
    securityError,
    setSecurityError,
  ] =
    useState<string | null>(
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

  function resetFlow() {
    setRecord(null);
    setSecurityError(null);
  }

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
          "2026-10-03T12:00:00.000Z",
      });

    const ready =
      markNftMintReady(
        created,
        nftAssetsFixture,
        nftCollectionsFixture,
        "2026-10-03T12:01:00.000Z"
      );

    setSecurityError(null);
    setRecord(ready);
  }

  function prepare() {
    if (!record) {
      return;
    }

    setRecord(
      prepareNftMint(
        record,
        "2026-10-03T12:02:00.000Z"
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
          record,
          failureMode
        ),
        "2026-10-03T12:03:00.000Z"
      )
    );
  }

  function verify() {
    if (!record) {
      return;
    }

    try {
      const result =
        verifyNftMintWithReplayProtection(
          record,
          registry,
          "2026-10-03T12:04:00.000Z"
        );

      setRecord(
        result.record
      );

      setRegistry(
        result.registry
      );

      setSecurityError(null);
    } catch (error) {
      setSecurityError(
        error instanceof Error
          ? error.message
          : "MINT_SECURITY_REJECTED"
      );
    }
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
            Verified Mint Lab
          </h3>

          <p>
            Mint lifecycle with deterministic
            evidence validation, replay protection
            and explicit failure handling.
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

              resetFlow();
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
                resetFlow();
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

                resetFlow();
              }}
            >
              <Sparkles size={15} />
              Mint-on-sale
            </button>
          </div>

          <span className="ti-label">
            Evidence scenario
          </span>

          <select
            value={failureMode}
            onChange={(event) => {
              setFailureMode(
                event.target
                  .value as FailureMode
              );

              resetFlow();
            }}
          >
            <option value="NONE">
              Valid evidence
            </option>

            <option value="FAILED_RECEIPT">
              Failed receipt
            </option>

            <option value="MISSING_EVENT">
              Missing mint event
            </option>

            <option value="OWNER_MISMATCH">
              Owner mismatch
            </option>

            <option value="METADATA_MISMATCH">
              Metadata mismatch
            </option>
          </select>

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
                Evidence claims
              </dt>

              <dd>
                {
                  registry.claims
                    .length
                }
              </dd>
            </div>

            <div>
              <dt>
                RPC
              </dt>

              <dd>
                None
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
              Select an asset and create
              a mint intent.
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
                  Intent validated
                </span>

                <span>
                  {record.prepared
                    ? "Preparation complete"
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
                    ? "Blockchain evidence verified"
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

              {securityError ? (
                <div className="ti-nft-mint__security">
                  <TriangleAlert
                    size={16}
                  />

                  <span>
                    {securityError}
                  </span>
                </div>
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
                  Verification failed. No
                  evidence claim was created.
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
          replay protection:on
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
