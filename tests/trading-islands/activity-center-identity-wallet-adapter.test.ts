import assert from "node:assert/strict";
import test from "node:test";

import {
  activityFromIdentitySessionStarted,
  activityFromWalletConnected,
  activityFromWalletChainChanged,
} from "../../src/trading/activity/adapters/identityWallet.ts";

import {
  createIdentityContext,
  createSessionId,
  createSubjectId,
  createTenantId,
  createTradingUserContext,
  createUserId,
  createWalletAddress,
  createWalletChain,
  createWalletConnection,
  createWalletConnectionId,
  createWalletId,
  createWalletIdentity,
  createWorkspaceId,
} from "../../src/trading/identity/index.ts";

const NOW =
  "2026-10-07T18:00:00.000Z";

function userContext() {
  const userId =
    createUserId(
      "usr_german001"
    );

  const tenantId =
    createTenantId(
      "ten_digitalboost"
    );

  const subjectId =
    createSubjectId(
      "sub_primary001"
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
          NOW,
      },

      sessionId:
        createSessionId(
          "ses_activity001"
        ),

      authentication: {
        status:
          "authenticated",
        subjectId,
        authenticatedAt:
          NOW,
        checkedAt:
          NOW,
        assurance:
          "strong",
      },

      authorization:
        null,

      evidence: [],

      lastValidatedAt:
        NOW,
    });

  return createTradingUserContext({
    identityContext:
      identity,

    workspaceId:
      createWorkspaceId(
        "wsp_activity001"
      ),

    environment:
      "test",

    createdAt:
      NOW,

    lastValidatedAt:
      NOW,
  });
}

function wallet(
  chainId = 137
) {
  return createWalletIdentity({
    walletId:
      createWalletId(
        "wal_activity001"
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
      NOW,
  });
}

test(
  "identity session projects into existing Activity Center model",
  () => {
    const event =
      activityFromIdentitySessionStarted(
        userContext(),
        1
      );

    assert.equal(
      event.domain,
      "SECURITY"
    );

    assert.equal(
      event.type,
      "STARTED"
    );

    assert.equal(
      event.actor.type,
      "USER"
    );

    assert.equal(
      event.authoritative,
      false
    );

    assert.equal(
      event.sequence,
      1
    );
  }
);

test(
  "wallet connection remains observational activity",
  () => {
    const context =
      userContext();

    const currentWallet =
      wallet();

    const connection =
      createWalletConnection({
        connectionId:
          createWalletConnectionId(
            "wcn_activity001"
          ),

        wallet:
          currentWallet,

        connectedAt:
          NOW,
      });

    const event =
      activityFromWalletConnected(
        context,
        currentWallet,
        connection,
        2
      );

    assert.equal(
      event.type,
      "STARTED"
    );

    assert.equal(
      event.authoritative,
      false
    );

    assert.ok(
      event.references.some(
        (reference) =>
          reference.kind ===
            "wallet"
      )
    );
  }
);

test(
  "wallet chain change preserves previous and current network evidence",
  () => {
    const event =
      activityFromWalletChainChanged(
        userContext(),
        wallet(137),
        wallet(1),
        NOW,
        3
      );

    assert.equal(
      event.type,
      "UPDATED"
    );

    assert.equal(
      event.authoritative,
      false
    );

    assert.ok(
      event.references.some(
        (reference) =>
          reference.kind ===
            "previous-chain" &&
          reference.ref ===
            "eip155:137"
      )
    );

    assert.ok(
      event.references.some(
        (reference) =>
          reference.kind ===
            "current-chain" &&
          reference.ref ===
            "eip155:1"
      )
    );
  }
);
