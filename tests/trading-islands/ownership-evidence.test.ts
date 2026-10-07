import assert from "node:assert/strict";
import test from "node:test";

import {
  bindOwnershipEvidenceToIdentity,
  buildWalletOwnershipEvidence,
  createAssetObservationId,
  createFungibleTokenAsset,
  createNativeTokenAsset,
  createNftAsset,
  createOwnershipEvidenceId,
  createTenantId,
  createUserId,
  createWalletAddress,
  createWalletAssetObservation,
  createWalletBindingId,
  createWalletChain,
  createWalletId,
  hasObservedNftHolding,
  markOwnershipEvidenceStale,
  readObservedAssetQuantity,
} from "../../src/trading/identity/index.ts";

const T0 =
  "2026-10-07T17:00:00.000Z";

const T1 =
  "2026-10-07T17:01:00.000Z";

const T2 =
  "2026-10-07T17:10:00.000Z";

const WALLET =
  createWalletAddress(
    "0x1111111111111111111111111111111111111111"
  );

const TOKEN =
  createWalletAddress(
    "0x2222222222222222222222222222222222222222"
  );

const NFT =
  createWalletAddress(
    "0x3333333333333333333333333333333333333333"
  );

const CHAIN =
  createWalletChain(137);

const WALLET_ID =
  createWalletId(
    "wal_primary001"
  );

const EVIDENCE_ID =
  createOwnershipEvidenceId(
    "owe_primary001"
  );

test(
  "native token observation preserves base-unit precision",
  () => {
    const observation =
      createWalletAssetObservation({
        observationId:
          createAssetObservationId(
            "aob_native001"
          ),

        evidenceId:
          EVIDENCE_ID,

        walletId:
          WALLET_ID,

        walletAddress:
          WALLET,

        chain:
          CHAIN,

        asset:
          createNativeTokenAsset(
            "MATIC",
            18
          ),

        quantity:
          "1234567890123456789",

        blockNumber:
          50000000,

        observedAt:
          T0,

        source:
          "blockchain-gateway",

        verifiedAt:
          T1,

        expiresAt:
          T2,
      });

    assert.equal(
      observation.quantity,
      "1234567890123456789"
    );

    assert.equal(
      observation.status,
      "verified"
    );

    assert.equal(
      observation.grantsAuthority,
      false
    );

    assert.equal(
      observation.claimsLegalOwnership,
      false
    );
  }
);

test(
  "fungible balances aggregate using integer arithmetic",
  () => {
    const asset =
      createFungibleTokenAsset(
        TOKEN,
        6,
        "USDT"
      );

    const first =
      createWalletAssetObservation({
        observationId:
          createAssetObservationId(
            "aob_token001"
          ),

        evidenceId:
          EVIDENCE_ID,

        walletId:
          WALLET_ID,

        walletAddress:
          WALLET,

        chain:
          CHAIN,

        asset,

        quantity:
          "1000000",

        blockNumber:
          50000000,

        observedAt:
          T0,

        source:
          "blockchain-gateway",
      });

    const second =
      createWalletAssetObservation({
        observationId:
          createAssetObservationId(
            "aob_token002"
          ),

        evidenceId:
          EVIDENCE_ID,

        walletId:
          WALLET_ID,

        walletAddress:
          WALLET,

        chain:
          CHAIN,

        asset,

        quantity:
          "2500000",

        blockNumber:
          50000001,

        observedAt:
          T1,

        source:
          "blockchain-gateway",
      });

    const evidence =
      buildWalletOwnershipEvidence({
        evidenceId:
          EVIDENCE_ID,

        walletId:
          WALLET_ID,

        walletAddress:
          WALLET,

        chain:
          CHAIN,

        observations:
          [first, second],

        observedAt:
          T1,
      });

    assert.equal(
      readObservedAssetQuantity(
        evidence,
        (candidate) =>
          candidate.kind ===
            "fungible-token" &&
          candidate.contractAddress ===
            TOKEN
      ),
      "3500000"
    );
  }
);

test(
  "NFT holding is descriptive only",
  () => {
    const observation =
      createWalletAssetObservation({
        observationId:
          createAssetObservationId(
            "aob_nft001"
          ),

        evidenceId:
          EVIDENCE_ID,

        walletId:
          WALLET_ID,

        walletAddress:
          WALLET,

        chain:
          CHAIN,

        asset:
          createNftAsset(
            NFT,
            "42"
          ),

        quantity:
          "1",

        blockNumber:
          50000000,

        observedAt:
          T0,

        source:
          "blockchain-gateway",

        verifiedAt:
          T1,
      });

    const evidence =
      buildWalletOwnershipEvidence({
        evidenceId:
          EVIDENCE_ID,

        walletId:
          WALLET_ID,

        walletAddress:
          WALLET,

        chain:
          CHAIN,

        observations:
          [observation],

        observedAt:
          T1,
      });

    assert.equal(
      hasObservedNftHolding(
        evidence,
        NFT,
        "42"
      ),
      true
    );

    assert.equal(
      evidence.grantsAuthority,
      false
    );

    assert.equal(
      evidence.claimsLegalOwnership,
      false
    );
  }
);

test(
  "NFT quantity cannot imply multiple ownership units",
  () => {
    assert.throws(
      () =>
        createWalletAssetObservation({
          observationId:
            createAssetObservationId(
              "aob_nft002"
            ),

          evidenceId:
            EVIDENCE_ID,

          walletId:
            WALLET_ID,

          walletAddress:
            WALLET,

          chain:
            CHAIN,

          asset:
            createNftAsset(
              NFT,
              "42"
            ),

          quantity:
            "2",

          blockNumber:
            50000000,

          observedAt:
            T0,

          source:
            "blockchain-gateway",
        }),
      /quantity must be 0 or 1/i
    );
  }
);

test(
  "cross-wallet observation cannot enter evidence bundle",
  () => {
    const foreignWallet =
      createWalletAddress(
        "0x4444444444444444444444444444444444444444"
      );

    const observation =
      createWalletAssetObservation({
        observationId:
          createAssetObservationId(
            "aob_cross001"
          ),

        evidenceId:
          EVIDENCE_ID,

        walletId:
          WALLET_ID,

        walletAddress:
          foreignWallet,

        chain:
          CHAIN,

        asset:
          createNativeTokenAsset(
            "MATIC",
            18
          ),

        quantity:
          "1",

        blockNumber:
          50000000,

        observedAt:
          T0,

        source:
          "blockchain-gateway",
      });

    assert.throws(
      () =>
        buildWalletOwnershipEvidence({
          evidenceId:
            EVIDENCE_ID,

          walletId:
            WALLET_ID,

          walletAddress:
            WALLET,

          chain:
            CHAIN,

          observations:
            [observation],

          observedAt:
            T0,
        }),
      /wallet address mismatch/i
    );
  }
);

test(
  "ownership evidence can explicitly become stale",
  () => {
    const evidence =
      buildWalletOwnershipEvidence({
        evidenceId:
          EVIDENCE_ID,

        walletId:
          WALLET_ID,

        walletAddress:
          WALLET,

        chain:
          CHAIN,

        observations:
          [],

        observedAt:
          T0,
      });

    const stale =
      markOwnershipEvidenceStale(
        evidence
      );

    assert.equal(
      stale.status,
      "stale"
    );

    assert.equal(
      stale.grantsAuthority,
      false
    );
  }
);

test(
  "identity-bound ownership evidence still grants no authority",
  () => {
    const evidence =
      buildWalletOwnershipEvidence({
        evidenceId:
          EVIDENCE_ID,

        walletId:
          WALLET_ID,

        walletAddress:
          WALLET,

        chain:
          CHAIN,

        observations:
          [],

        observedAt:
          T0,
      });

    const bound =
      bindOwnershipEvidenceToIdentity({
        evidence,

        bindingId:
          createWalletBindingId(
            "wbd_primary001"
          ),

        userId:
          createUserId(
            "usr_german001"
          ),

        tenantId:
          createTenantId(
            "ten_digitalboost"
          ),
      });

    assert.equal(
      bound.grantsAuthority,
      false
    );
  }
);
