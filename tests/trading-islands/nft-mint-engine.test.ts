import assert from "node:assert/strict";
import test from "node:test";

import {
  confirmAndVerifyNftMint,
  markNftMintReady,
  prepareNftMint,
  submitNftMintEvidence,
} from "../../src/trading/nft/mint/engine";

import {
  createNftMintRecord,
} from "../../src/trading/nft/mint/factory";

import {
  canTransitionNftMint,
} from "../../src/trading/nft/mint/stateMachine";

import {
  nftAssetsFixture,
  nftCollectionsFixture,
} from "../../src/trading/nft/fixtures";

import type {
  NftMintTransactionEvidence,
} from "../../src/trading/nft/mint/types";

function validEvidence():
  NftMintTransactionEvidence {
  return {
    chainId: "deterministic-1",
    contractAddress:
      "contract-local-001",
    transactionHash:
      "tx-local-001",
    blockNumber: 100,
    receiptStatus: "SUCCESS",
    tokenId: "1",
    owner:
      "owner-local-001",
    metadataRef:
      "metadata://asset-origin-001",
    mintEventFound: true,
    authoritative: false,
  };
}

function baseRecord() {
  return createNftMintRecord({
    id:
      "mint-intent-001",
    assetId:
      "asset-origin-001",
    collectionId:
      "collection-origin-001",
    mode:
      "BASIC",
    expectedOwner:
      "owner-local-001",
    expectedMetadataRef:
      "metadata://asset-origin-001",
    requestedAt:
      "2026-10-01T12:00:00.000Z",
  });
}

test(
  "mint lifecycle rejects illegal direct verification",
  () => {
    assert.equal(
      canTransitionNftMint(
        "DRAFT",
        "VERIFIED"
      ),
      false
    );

    assert.equal(
      canTransitionNftMint(
        "SUBMITTED",
        "VERIFIED"
      ),
      false
    );
  }
);

test(
  "basic mint intent carries 150 DBX pricing intent without settlement authority",
  () => {
    const record =
      baseRecord();

    assert.equal(
      record.intent.pricing
        .upfrontDbx,
      150
    );

    assert.equal(
      record.intent.pricing
        .authoritative,
      false
    );
  }
);

test(
  "valid mint follows explicit lifecycle to verified",
  () => {
    let record =
      baseRecord();

    record =
      markNftMintReady(
        record,
        nftAssetsFixture,
        nftCollectionsFixture,
        "2026-10-01T12:01:00.000Z"
      );

    record =
      prepareNftMint(
        record,
        "2026-10-01T12:02:00.000Z"
      );

    record =
      submitNftMintEvidence(
        record,
        validEvidence(),
        "2026-10-01T12:03:00.000Z"
      );

    assert.equal(
      record.status,
      "SUBMITTED"
    );

    assert.equal(
      record.verification,
      null
    );

    record =
      confirmAndVerifyNftMint(
        record,
        "2026-10-01T12:04:00.000Z"
      );

    assert.equal(
      record.status,
      "VERIFIED"
    );

    assert.equal(
      record.verification
        ?.verified,
      true
    );
  }
);

test(
  "transaction hash alone can never verify mint",
  () => {
    let record =
      baseRecord();

    record =
      markNftMintReady(
        record,
        nftAssetsFixture,
        nftCollectionsFixture,
        "2026-10-01T12:01:00.000Z"
      );

    record =
      prepareNftMint(
        record,
        "2026-10-01T12:02:00.000Z"
      );

    const weakEvidence:
      NftMintTransactionEvidence = {
      ...validEvidence(),
      tokenId: null,
      owner: null,
      metadataRef: null,
      mintEventFound: false,
    };

    record =
      submitNftMintEvidence(
        record,
        weakEvidence,
        "2026-10-01T12:03:00.000Z"
      );

    record =
      confirmAndVerifyNftMint(
        record,
        "2026-10-01T12:04:00.000Z"
      );

    assert.equal(
      record.status,
      "FAILED"
    );

    assert.equal(
      record.verification
        ?.verified,
      false
    );
  }
);

test(
  "owner mismatch fails verification",
  () => {
    let record =
      baseRecord();

    record =
      markNftMintReady(
        record,
        nftAssetsFixture,
        nftCollectionsFixture,
        "2026-10-01T12:01:00.000Z"
      );

    record =
      prepareNftMint(
        record,
        "2026-10-01T12:02:00.000Z"
      );

    record =
      submitNftMintEvidence(
        record,
        {
          ...validEvidence(),
          owner:
            "unexpected-owner",
        },
        "2026-10-01T12:03:00.000Z"
      );

    record =
      confirmAndVerifyNftMint(
        record,
        "2026-10-01T12:04:00.000Z"
      );

    assert.equal(
      record.status,
      "FAILED"
    );

    assert.ok(
      record.verification
        ?.issues.some(
          (issue) =>
            issue.code ===
            "OWNER_MISMATCH"
        )
    );
  }
);

test(
  "deterministic mint domain has no RPC or wallet execution",
  async () => {
    const fs =
      await import(
        "node:fs"
      );

    const paths = [
      "src/trading/nft/mint/engine.ts",
      "src/trading/nft/mint/deterministicPort.ts",
      "src/trading/nft/mint/verification.ts",
    ];

    const content =
      paths
        .map(
          (path) =>
            fs.readFileSync(
              path,
              "utf8"
            )
        )
        .join("\n");

    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /WebSocket/
    );

    assert.doesNotMatch(
      content,
      /ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      content,
      /eth_sendTransaction/
    );
  }
);
