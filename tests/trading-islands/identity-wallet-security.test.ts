import assert from "node:assert/strict";
import test from "node:test";

import {
  buildWalletOwnershipEvidence,
  consumeWalletProof,
  createIdentityContext,
  createOwnershipEvidenceId,
  createSessionId,
  createSubjectId,
  createTenantId,
  createTradingUserContext,
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
  createWalletProofReplayRegistry,
  createWalletSignatureEvidence,
  createWorkspaceId,
  markOwnershipEvidenceStale,
  validateIdentitySessionSecurity,
  validateOwnershipEvidenceSecurity,
  validateWalletBindingSecurity,
  validateWalletConnectionSecurity,
  validateWalletProofSecurity,
} from "../../src/trading/identity/index.ts";

const T0 =
  "2026-10-07T18:00:00.000Z";

const T1 =
  "2026-10-07T18:01:00.000Z";

const T2 =
  "2026-10-07T18:30:00.000Z";

const T3 =
  "2026-10-07T19:00:00.000Z";

const HASH =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function context(
  tenant =
    "ten_digitalboost"
) {
  const userId =
    createUserId(
      "usr_security001"
    );

  const tenantId =
    createTenantId(
      tenant
    );

  const subjectId =
    createSubjectId(
      "sub_security001"
    );

  const identity =
    createIdentityContext({
      identity: {
        userId,
        tenantId,
        subjectId,
        source:
          "server-session",
        state:
          "active",
        createdAt:
          T0,
      },

      sessionId:
        createSessionId(
          "ses_security001"
        ),

      authentication: {
        status:
          "authenticated",
        subjectId,
        authenticatedAt:
          T0,
        checkedAt:
          T0,
        assurance:
          "strong",
      },

      authorization:
        null,

      evidence:
        [],

      lastValidatedAt:
        T0,
    });

  return createTradingUserContext({
    identityContext:
      identity,

    workspaceId:
      createWorkspaceId(
        "wsp_security001"
      ),

    environment:
      "test",

    createdAt:
      T0,

    lastValidatedAt:
      T0,
  });
}

function wallet(
  chainId = 137
) {
  return createWalletIdentity({
    walletId:
      createWalletId(
        "wal_security001"
      ),

    address:
      createWalletAddress(
        "0x1111111111111111111111111111111111111111"
      ),

    chain:
      createWalletChain(
        chainId
      ),

    createdAt:
      T0,
  });
}

function verifiedProof() {
  const currentWallet =
    wallet();

  const evidence =
    createWalletSignatureEvidence({
      evidenceId:
        "iev_security001" as never,

      proofId:
        createWalletProofId(
          "wpf_security001"
        ),

      wallet:
        currentWallet,

      challengeId:
        "challenge-security-001",

      challengeHash:
        HASH,

      observedAt:
        T0,

      verifiedAt:
        T1,

      expiresAt:
        T3,
    });

  return createWalletProof(
    evidence
  );
}

test(
  "verified non-expired proof passes security check without granting authority",
  () => {
    const result =
      validateWalletProofSecurity(
        verifiedProof(),
        T2
      );

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      result.grantsAuthority,
      false
    );
  }
);

test(
  "expired wallet proof fails closed",
  () => {
    const result =
      validateWalletProofSecurity(
        verifiedProof(),
        T3
      );

    assert.equal(
      result.ok,
      false
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "PROOF_EXPIRED"
      );
    }
  }
);

test(
  "wallet proof cannot be consumed twice",
  () => {
    const proof =
      verifiedProof();

    const registry =
      createWalletProofReplayRegistry();

    const first =
      consumeWalletProof(
        registry,
        proof
      );

    assert.equal(
      first.ok,
      true
    );

    if (!first.ok) {
      return;
    }

    const second =
      consumeWalletProof(
        first.registry,
        proof
      );

    assert.equal(
      second.ok,
      false
    );

    if (!second.ok) {
      assert.equal(
        second.code,
        "PROOF_REPLAY"
      );
    }
  }
);

test(
  "cross-tenant wallet binding fails closed",
  () => {
    const currentContext =
      context(
        "ten_digitalboost"
      );

    const currentWallet =
      wallet();

    const binding =
      createWalletBinding({
        bindingId:
          createWalletBindingId(
            "wbd_security001"
          ),

        userId:
          currentContext.userId,

        tenantId:
          createTenantId(
            "ten_foreign001"
          ),

        wallet:
          currentWallet,

        proof:
          verifiedProof(),

        createdAt:
          T1,
      });

    const result =
      validateWalletBindingSecurity(
        currentContext,
        binding,
        currentWallet
      );

    assert.equal(
      result.ok,
      false
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "TENANT_MISMATCH"
      );
    }
  }
);

test(
  "wallet connection chain mismatch fails closed",
  () => {
    const polygonWallet =
      wallet(137);

    const ethereumWallet =
      wallet(1);

    const connection =
      createWalletConnection({
        connectionId:
          createWalletConnectionId(
            "wcn_security001"
          ),

        wallet:
          polygonWallet,

        connectedAt:
          T0,
      });

    const result =
      validateWalletConnectionSecurity(
        ethereumWallet,
        connection
      );

    assert.equal(
      result.ok,
      false
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "CHAIN_MISMATCH"
      );
    }
  }
);

test(
  "stale ownership evidence fails closed",
  () => {
    const currentWallet =
      wallet();

    const evidence =
      buildWalletOwnershipEvidence({
        evidenceId:
          createOwnershipEvidenceId(
            "owe_security001"
          ),

        walletId:
          currentWallet.walletId,

        walletAddress:
          currentWallet.address,

        chain:
          currentWallet.chain,

        observations:
          [],

        observedAt:
          T0,
      });

    const stale =
      markOwnershipEvidenceStale(
        evidence
      );

    const result =
      validateOwnershipEvidenceSecurity(
        currentWallet,
        stale
      );

    assert.equal(
      result.ok,
      false
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "OWNERSHIP_STALE"
      );
    }
  }
);

test(
  "session confusion is rejected",
  () => {
    const result =
      validateIdentitySessionSecurity(
        "ses_other001",
        context()
      );

    assert.equal(
      result.ok,
      false
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "SESSION_MISMATCH"
      );
    }
  }
);
