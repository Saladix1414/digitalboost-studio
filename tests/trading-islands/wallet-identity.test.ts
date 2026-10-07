import assert from "node:assert/strict";
import test from "node:test";

import {
  createIdentityEvidenceId,
  createTenantId,
  createUserId,
  createWalletAddress,
  createWalletBinding,
  createWalletBindingId,
  createWalletChain,
  createWalletConnection,
  createWalletConnectionId,
  createWalletId,
  createWalletIdentity,
  createWalletProof,
  createWalletProofId,
  createWalletSignatureEvidence,
  disconnectWalletConnection,
  revokeWalletBinding,
  walletBindingMatches,
} from "../../src/trading/identity/index.ts";

const T0 =
  "2026-10-07T15:00:00.000Z";

const T1 =
  "2026-10-07T15:01:00.000Z";

const T2 =
  "2026-10-07T15:10:00.000Z";

const HASH =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function walletFixture() {
  return createWalletIdentity({
    walletId:
      createWalletId(
        "wal_primary001"
      ),

    address:
      createWalletAddress(
        "0x1111111111111111111111111111111111111111"
      ),

    chain:
      createWalletChain(137),

    createdAt:
      T0,
  });
}

test(
  "wallet identity preserves wallet and chain without becoming user identity",
  () => {
    const wallet =
      walletFixture();

    assert.equal(
      wallet.walletId,
      "wal_primary001"
    );

    assert.equal(
      wallet.address,
      "0x1111111111111111111111111111111111111111"
    );

    assert.equal(
      wallet.chain.chainId,
      137
    );

    assert.equal(
      wallet.chain.namespace,
      "eip155:137"
    );
  }
);

test(
  "wallet connection is not ownership proof or authority",
  () => {
    const connection =
      createWalletConnection({
        connectionId:
          createWalletConnectionId(
            "wcn_primary001"
          ),

        wallet:
          walletFixture(),

        connectedAt:
          T0,
      });

    assert.equal(
      connection.state,
      "connected"
    );

    assert.equal(
      connection.provesOwnership,
      false
    );

    assert.equal(
      connection.grantsAuthority,
      false
    );
  }
);

test(
  "wallet disconnect preserves connection history",
  () => {
    const connected =
      createWalletConnection({
        connectionId:
          createWalletConnectionId(
            "wcn_primary001"
          ),

        wallet:
          walletFixture(),

        connectedAt:
          T0,
      });

    const disconnected =
      disconnectWalletConnection(
        connected,
        T1
      );

    assert.equal(
      disconnected.state,
      "disconnected"
    );

    assert.equal(
      disconnected.connectedAt,
      T0
    );

    assert.equal(
      disconnected.disconnectedAt,
      T1
    );
  }
);

test(
  "verified signature evidence still grants no authority",
  () => {
    const evidence =
      createWalletSignatureEvidence({
        evidenceId:
          createIdentityEvidenceId(
            "iev_wallet001"
          ),

        proofId:
          createWalletProofId(
            "wpf_wallet001"
          ),

        wallet:
          walletFixture(),

        challengeId:
          "challenge-001",

        challengeHash:
          HASH,

        observedAt:
          T0,

        verifiedAt:
          T1,

        expiresAt:
          T2,
      });

    assert.equal(
      evidence.verificationState,
      "verified"
    );

    assert.equal(
      evidence.signatureStored,
      false
    );

    assert.equal(
      evidence.grantsAuthority,
      false
    );
  }
);

test(
  "active wallet binding requires verified proof",
  () => {
    const wallet =
      walletFixture();

    const evidence =
      createWalletSignatureEvidence({
        evidenceId:
          createIdentityEvidenceId(
            "iev_wallet001"
          ),

        proofId:
          createWalletProofId(
            "wpf_wallet001"
          ),

        wallet,

        challengeId:
          "challenge-001",

        challengeHash:
          HASH,

        observedAt:
          T0,

        verifiedAt:
          T1,

        expiresAt:
          T2,
      });

    const proof =
      createWalletProof(
        evidence
      );

    const userId =
      createUserId(
        "usr_german001"
      );

    const tenantId =
      createTenantId(
        "ten_digitalboost"
      );

    const binding =
      createWalletBinding({
        bindingId:
          createWalletBindingId(
            "wbd_primary001"
          ),

        userId,
        tenantId,
        wallet,
        proof,

        createdAt:
          T1,
      });

    assert.equal(
      binding.state,
      "active"
    );

    assert.equal(
      binding.grantsAuthority,
      false
    );

    assert.equal(
      walletBindingMatches(
        binding,
        userId,
        tenantId,
        wallet
      ),
      true
    );
  }
);

test(
  "unverified proof cannot create active binding",
  () => {
    const wallet =
      walletFixture();

    const evidence =
      createWalletSignatureEvidence({
        evidenceId:
          createIdentityEvidenceId(
            "iev_wallet002"
          ),

        proofId:
          createWalletProofId(
            "wpf_wallet002"
          ),

        wallet,

        challengeId:
          "challenge-002",

        challengeHash:
          HASH,

        observedAt:
          T0,

        expiresAt:
          T2,
      });

    const proof =
      createWalletProof(
        evidence
      );

    assert.throws(
      () =>
        createWalletBinding({
          bindingId:
            createWalletBindingId(
              "wbd_primary002"
            ),

          userId:
            createUserId(
              "usr_german001"
            ),

          tenantId:
            createTenantId(
              "ten_digitalboost"
            ),

          wallet,
          proof,

          createdAt:
            T1,
        }),
      /verified proof/i
    );
  }
);

test(
  "wallet binding revocation is explicit and non authoritative",
  () => {
    const wallet =
      walletFixture();

    const evidence =
      createWalletSignatureEvidence({
        evidenceId:
          createIdentityEvidenceId(
            "iev_wallet003"
          ),

        proofId:
          createWalletProofId(
            "wpf_wallet003"
          ),

        wallet,

        challengeId:
          "challenge-003",

        challengeHash:
          HASH,

        observedAt:
          T0,

        verifiedAt:
          T1,

        expiresAt:
          T2,
      });

    const binding =
      createWalletBinding({
        bindingId:
          createWalletBindingId(
            "wbd_primary003"
          ),

        userId:
          createUserId(
            "usr_german001"
          ),

        tenantId:
          createTenantId(
            "ten_digitalboost"
          ),

        wallet,

        proof:
          createWalletProof(
            evidence
          ),

        createdAt:
          T1,
      });

    const revoked =
      revokeWalletBinding(
        binding,
        T2,
        "user-requested"
      );

    assert.equal(
      revoked.state,
      "revoked"
    );

    assert.equal(
      revoked.revocationReason,
      "user-requested"
    );

    assert.equal(
      revoked.grantsAuthority,
      false
    );
  }
);

test(
  "invalid EVM address is rejected",
  () => {
    assert.throws(
      () =>
        createWalletAddress(
          "not-a-wallet"
        ),
      /valid EVM address/i
    );
  }
);

test(
  "invalid chain identifier is rejected",
  () => {
    assert.throws(
      () =>
        createWalletChain(0),
      /chainId/i
    );
  }
);
