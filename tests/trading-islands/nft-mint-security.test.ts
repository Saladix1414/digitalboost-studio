import assert from "node:assert/strict";
import test from "node:test";

import {
  createEmptyMintEvidenceRegistry,
} from "../../src/trading/nft/mint/evidenceRegistryFactory";

import {
  inspectMintEvidenceSecurity,
} from "../../src/trading/nft/mint/evidenceRegistry";

import {
  verifyNftMintWithReplayProtection,
} from "../../src/trading/nft/mint/hardenedVerification";

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
  nftAssetsFixture,
  nftCollectionsFixture,
} from "../../src/trading/nft/fixtures";

import type {
  NftMintRecord,
  NftMintTransactionEvidence,
} from "../../src/trading/nft/mint/types";

function makeRecord(
  id: string,
  assetId = "asset-origin-001"
): NftMintRecord {
  return createNftMintRecord({
    id,
    assetId,
    collectionId:
      "collection-origin-001",
    mode:
      "BASIC",
    expectedOwner:
      "owner-local-001",
    expectedMetadataRef:
      `metadata://${assetId}`,
    requestedAt:
      "2026-10-02T12:00:00.000Z",
  });
}

function makeEvidence(
  transactionHash: string,
  tokenId: string
): NftMintTransactionEvidence {
  return {
    chainId:
      "deterministic-1",

    contractAddress:
      "contract-local-001",

    transactionHash,

    blockNumber: 100,

    receiptStatus:
      "SUCCESS",

    tokenId,

    owner:
      "owner-local-001",

    metadataRef:
      "metadata://asset-origin-001",

    mintEventFound:
      true,

    authoritative:
      false,
  };
}

function moveToSubmitted(
  record:
    NftMintRecord,
  evidence:
    NftMintTransactionEvidence
): NftMintRecord {
  let current =
    markNftMintReady(
      record,
      nftAssetsFixture,
      nftCollectionsFixture,
      "2026-10-02T12:01:00.000Z"
    );

  current =
    prepareNftMint(
      current,
      "2026-10-02T12:02:00.000Z"
    );

  return submitNftMintEvidence(
    current,
    evidence,
    "2026-10-02T12:03:00.000Z"
  );
}

test(
  "successful verified mint claims evidence exactly once",
  () => {
    const record =
      moveToSubmitted(
        makeRecord(
          "mint-security-001"
        ),
        makeEvidence(
          "tx-security-001",
          "1"
        )
      );

    const registry =
      createEmptyMintEvidenceRegistry();

    const result =
      verifyNftMintWithReplayProtection(
        record,
        registry,
        "2026-10-02T12:04:00.000Z"
      );

    assert.equal(
      result.record.status,
      "VERIFIED"
    );

    assert.equal(
      result.registry.claims.length,
      1
    );

    assert.equal(
      result.registry.claims[0]
        ?.authoritative,
      false
    );
  }
);

test(
  "same transaction cannot verify a second mint intent",
  () => {
    const first =
      moveToSubmitted(
        makeRecord(
          "mint-security-first"
        ),
        makeEvidence(
          "tx-replay-001",
          "21"
        )
      );

    const firstResult =
      verifyNftMintWithReplayProtection(
        first,
        createEmptyMintEvidenceRegistry(),
        "2026-10-02T12:04:00.000Z"
      );

    const second =
      moveToSubmitted(
        makeRecord(
          "mint-security-second"
        ),
        makeEvidence(
          "tx-replay-001",
          "22"
        )
      );

    assert.throws(
      () =>
        verifyNftMintWithReplayProtection(
          second,
          firstResult.registry,
          "2026-10-02T12:05:00.000Z"
        ),
      /DUPLICATE_TRANSACTION|EVIDENCE_REPLAY/
    );
  }
);

test(
  "same token evidence cannot verify a different mint intent",
  () => {
    const first =
      moveToSubmitted(
        makeRecord(
          "mint-token-first"
        ),
        makeEvidence(
          "tx-token-001",
          "99"
        )
      );

    const firstResult =
      verifyNftMintWithReplayProtection(
        first,
        createEmptyMintEvidenceRegistry(),
        "2026-10-02T12:04:00.000Z"
      );

    const second =
      moveToSubmitted(
        makeRecord(
          "mint-token-second"
        ),
        makeEvidence(
          "tx-token-002",
          "99"
        )
      );

    assert.throws(
      () =>
        verifyNftMintWithReplayProtection(
          second,
          firstResult.registry,
          "2026-10-02T12:05:00.000Z"
        ),
      /DUPLICATE_TOKEN/
    );
  }
);

test(
  "already claimed evidence is rejected for the same intent",
  () => {
    const record =
      moveToSubmitted(
        makeRecord(
          "mint-repeat-001"
        ),
        makeEvidence(
          "tx-repeat-001",
          "77"
        )
      );

    const first =
      verifyNftMintWithReplayProtection(
        record,
        createEmptyMintEvidenceRegistry(),
        "2026-10-02T12:04:00.000Z"
      );

    const inspection =
      inspectMintEvidenceSecurity(
        first.registry,
        record.intent,
        record.evidence!
      );

    assert.equal(
      inspection.accepted,
      false
    );

    assert.ok(
      inspection.issues.some(
        (issue) =>
          issue.code ===
          "EVIDENCE_ALREADY_CLAIMED"
      )
    );
  }
);

test(
  "failed receipt can never claim evidence",
  () => {
    const failedEvidence:
      NftMintTransactionEvidence = {
      ...makeEvidence(
        "tx-failed-001",
        "501"
      ),
      receiptStatus:
        "FAILED",
    };

    const record =
      moveToSubmitted(
        makeRecord(
          "mint-failed-receipt"
        ),
        failedEvidence
      );

    const result =
      verifyNftMintWithReplayProtection(
        record,
        createEmptyMintEvidenceRegistry(),
        "2026-10-02T12:04:00.000Z"
      );

    assert.equal(
      result.record.status,
      "FAILED"
    );

    assert.equal(
      result.registry.claims.length,
      0
    );

    assert.ok(
      result.record.verification
        ?.issues.some(
          (issue) =>
            issue.code ===
            "RECEIPT_FAILED"
        )
    );
  }
);

test(
  "missing mint event can never claim evidence",
  () => {
    const evidence:
      NftMintTransactionEvidence = {
      ...makeEvidence(
        "tx-no-event-001",
        "601"
      ),
      mintEventFound:
        false,
    };

    const record =
      moveToSubmitted(
        makeRecord(
          "mint-no-event"
        ),
        evidence
      );

    const result =
      verifyNftMintWithReplayProtection(
        record,
        createEmptyMintEvidenceRegistry(),
        "2026-10-02T12:04:00.000Z"
      );

    assert.equal(
      result.record.status,
      "FAILED"
    );

    assert.equal(
      result.registry.claims.length,
      0
    );
  }
);

test(
  "owner mismatch can never claim evidence",
  () => {
    const evidence:
      NftMintTransactionEvidence = {
      ...makeEvidence(
        "tx-owner-mismatch-001",
        "701"
      ),
      owner:
        "attacker-owner",
    };

    const record =
      moveToSubmitted(
        makeRecord(
          "mint-owner-mismatch"
        ),
        evidence
      );

    const result =
      verifyNftMintWithReplayProtection(
        record,
        createEmptyMintEvidenceRegistry(),
        "2026-10-02T12:04:00.000Z"
      );

    assert.equal(
      result.record.status,
      "FAILED"
    );

    assert.equal(
      result.registry.claims.length,
      0
    );
  }
);

test(
  "metadata mismatch can never claim evidence",
  () => {
    const evidence:
      NftMintTransactionEvidence = {
      ...makeEvidence(
        "tx-metadata-mismatch-001",
        "801"
      ),
      metadataRef:
        "metadata://wrong-asset",
    };

    const record =
      moveToSubmitted(
        makeRecord(
          "mint-metadata-mismatch"
        ),
        evidence
      );

    const result =
      verifyNftMintWithReplayProtection(
        record,
        createEmptyMintEvidenceRegistry(),
        "2026-10-02T12:04:00.000Z"
      );

    assert.equal(
      result.record.status,
      "FAILED"
    );

    assert.equal(
      result.registry.claims.length,
      0
    );
  }
);

test(
  "transaction hash alone remains insufficient",
  () => {
    const weakEvidence:
      NftMintTransactionEvidence = {
      chainId:
        "deterministic-1",

      contractAddress:
        "contract-local-001",

      transactionHash:
        "tx-hash-only-001",

      blockNumber:
        100,

      receiptStatus:
        "SUCCESS",

      tokenId:
        null,

      owner:
        null,

      metadataRef:
        null,

      mintEventFound:
        false,

      authoritative:
        false,
    };

    const record =
      moveToSubmitted(
        makeRecord(
          "mint-hash-only"
        ),
        weakEvidence
      );

    const verified =
      confirmAndVerifyNftMint(
        record,
        "2026-10-02T12:04:00.000Z"
      );

    assert.equal(
      verified.status,
      "FAILED"
    );

    assert.equal(
      verified.verification
        ?.verified,
      false
    );
  }
);
