import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  bindOwnershipEvidenceToIdentity,
  buildWalletOwnershipEvidence,
  connectWallet,
  createAssetObservationId,
  createIdentityContext,
  createNativeTokenAsset,
  createOwnershipEvidenceId,
  createSessionId,
  createSubjectId,
  createTenantId,
  createTradingUserContext,
  createUserId,
  createWalletAssetObservation,
  createWalletBindingId,
  createWalletConnectionId,
  createWalletId,
  createWorkspaceId,
  markOwnershipEvidenceStale,
  switchWalletChain,
  validateIdentitySessionSecurity,
  validateOwnershipEvidenceSecurity,
  validateWalletConnectionSecurity,
} from "../../src/trading/identity/index.ts";

import type {
  WalletConnection,
  WalletConnectorPort,
} from "../../src/trading/identity/index.ts";

import {
  activityFromWalletConnected,
  activityFromWalletOwnershipObserved,
} from "../../src/trading/activity/adapters/identityWallet.ts";

const T0 =
  "2026-10-07T20:00:00.000Z";

const T1 =
  "2026-10-07T20:01:00.000Z";

const T2 =
  "2026-10-07T20:02:00.000Z";

function createTestUserContext() {
  const userId =
    createUserId(
      "usr_integration001"
    );

  const tenantId =
    createTenantId(
      "ten_integration001"
    );

  const subjectId =
    createSubjectId(
      "sub_integration001"
    );

  const identityContext =
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
          "ses_integration001"
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
    identityContext,

    workspaceId:
      createWorkspaceId(
        "wsp_integration001"
      ),

    environment:
      "test",

    createdAt:
      T0,

    lastValidatedAt:
      T0,
  });
}

function createConnector(
  initialChainId:
    number = 137
): WalletConnectorPort {
  let chainId =
    initialChainId;

  return {
    async requestAccounts() {
      return [
        {
          address:
            "0x1111111111111111111111111111111111111111",
        },
      ];
    },

    async getChainId() {
      return chainId;
    },

    async switchChain(
      nextChainId:
        number
    ) {
      chainId =
        nextChainId;
    },
  };
}

test(
  "authenticated identity can establish non-authoritative wallet connection",
  async () => {
    const context =
      createTestUserContext();

    const connector =
      createConnector();

    const sessionSecurity =
      validateIdentitySessionSecurity(
        context.sessionId,
        context
      );

    assert.equal(
      sessionSecurity.ok,
      true
    );

    assert.equal(
      sessionSecurity.grantsAuthority,
      false
    );

    const result =
      await connectWallet({
        connector,

        walletId:
          createWalletId(
            "wal_integration001"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_integration001"
          ),

        supportedChainIds:
          [1, 137],

        connectedAt:
          T0,
      });

    assert.equal(
      result.ok,
      true
    );

    if (!result.ok) {
      return;
    }

    const connectionSecurity =
      validateWalletConnectionSecurity(
        result.wallet,
        result.connection
      );

    assert.equal(
      connectionSecurity.ok,
      true
    );

    assert.equal(
      connectionSecurity.grantsAuthority,
      false
    );

    const activity =
      activityFromWalletConnected(
        context,
        result.wallet,
        result.connection,
        1
      );

    assert.equal(
      activity.domain,
      "SECURITY"
    );

    assert.equal(
      activity.authoritative,
      false
    );

    assert.ok(
      activity.references.some(
        (reference) =>
          reference.kind ===
            "wallet"
      )
    );
  }
);

test(
  "chain switch invalidates old connection chain until state is reconciled",
  async () => {
    const connector =
      createConnector(137);

    const connected =
      await connectWallet({
        connector,

        walletId:
          createWalletId(
            "wal_integration002"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_integration002"
          ),

        supportedChainIds:
          [1, 137],

        connectedAt:
          T0,
      });

    assert.equal(
      connected.ok,
      true
    );

    if (!connected.ok) {
      return;
    }

    const switched =
      await switchWalletChain({
        connector,

        wallet:
          connected.wallet,

        targetChainId:
          1,

        supportedChainIds:
          [1, 137],
      });

    assert.equal(
      switched.ok,
      true
    );

    if (!switched.ok) {
      return;
    }

    assert.equal(
      switched.wallet.chain.chainId,
      1
    );

    const staleConnectionResult =
      validateWalletConnectionSecurity(
        switched.wallet,
        connected.connection
      );

    assert.equal(
      staleConnectionResult.ok,
      false
    );

    if (
      !staleConnectionResult.ok
    ) {
      assert.equal(
        staleConnectionResult.code,
        "CHAIN_MISMATCH"
      );
    }

    const reconciledConnection:
      WalletConnection = {
        ...connected.connection,

        chain:
          switched.wallet.chain,
      };

    const reconciledResult =
      validateWalletConnectionSecurity(
        switched.wallet,
        reconciledConnection
      );

    assert.equal(
      reconciledResult.ok,
      true
    );

    assert.equal(
      reconciledResult.grantsAuthority,
      false
    );
  }
);

test(
  "verified ownership observation integrates with security and Activity Center",
  async () => {
    const context =
      createTestUserContext();

    const connected =
      await connectWallet({
        connector:
          createConnector(),

        walletId:
          createWalletId(
            "wal_integration003"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_integration003"
          ),

        supportedChainIds:
          [137],

        connectedAt:
          T0,
      });

    assert.equal(
      connected.ok,
      true
    );

    if (!connected.ok) {
      return;
    }

    const evidenceId =
      createOwnershipEvidenceId(
        "owe_integration001"
      );

    const observation =
      createWalletAssetObservation({
        observationId:
          createAssetObservationId(
            "aob_integration001"
          ),

        evidenceId,

        walletId:
          connected.wallet.walletId,

        walletAddress:
          connected.wallet.address,

        chain:
          connected.wallet.chain,

        asset:
          createNativeTokenAsset(
            "MATIC",
            18
          ),

        quantity:
          "1000000000000000000",

        blockNumber:
          50000000,

        observedAt:
          T1,

        verifiedAt:
          T2,

        source:
          "test",
      });

    const evidence =
      buildWalletOwnershipEvidence({
        evidenceId,

        walletId:
          connected.wallet.walletId,

        walletAddress:
          connected.wallet.address,

        chain:
          connected.wallet.chain,

        observations:
          [observation],

        observedAt:
          T2,
      });

    assert.equal(
      evidence.status,
      "verified"
    );

    const security =
      validateOwnershipEvidenceSecurity(
        connected.wallet,
        evidence
      );

    assert.equal(
      security.ok,
      true
    );

    assert.equal(
      security.grantsAuthority,
      false
    );

    const boundEvidence =
      bindOwnershipEvidenceToIdentity({
        evidence,

        bindingId:
          createWalletBindingId(
            "wbd_integration001"
          ),

        userId:
          context.userId,

        tenantId:
          context.tenantId,
      });

    const activity =
      activityFromWalletOwnershipObserved(
        boundEvidence,
        2
      );

    assert.equal(
      activity.domain,
      "BLOCKCHAIN"
    );

    assert.equal(
      activity.type,
      "VERIFIED"
    );

    assert.equal(
      activity.authoritative,
      false
    );

    assert.ok(
      activity.references.some(
        (reference) =>
          reference.kind ===
            "ownership-evidence"
      )
    );
  }
);

test(
  "stale ownership fails closed and never becomes authority",
  async () => {
    const connected =
      await connectWallet({
        connector:
          createConnector(),

        walletId:
          createWalletId(
            "wal_integration004"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_integration004"
          ),

        supportedChainIds:
          [137],

        connectedAt:
          T0,
      });

    assert.equal(
      connected.ok,
      true
    );

    if (!connected.ok) {
      return;
    }

    const evidence =
      buildWalletOwnershipEvidence({
        evidenceId:
          createOwnershipEvidenceId(
            "owe_integration002"
          ),

        walletId:
          connected.wallet.walletId,

        walletAddress:
          connected.wallet.address,

        chain:
          connected.wallet.chain,

        observations:
          [],

        observedAt:
          T1,
      });

    const stale =
      markOwnershipEvidenceStale(
        evidence
      );

    const result =
      validateOwnershipEvidenceSecurity(
        connected.wallet,
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

      assert.equal(
        result.grantsAuthority,
        false
      );
    }
  }
);

test(
  "wallet workspace is routed without direct provider or transaction execution",
  () => {
    const workspace =
      fs.readFileSync(
        new URL(
          "../../src/trading/TradingIslandsWorkspace.tsx",
          import.meta.url
        ),
        "utf8"
      );

    const walletWorkspace =
      fs.readFileSync(
        new URL(
          "../../src/trading/identity/WalletWorkspace.tsx",
          import.meta.url
        ),
        "utf8"
      );

    const sidebar =
      fs.readFileSync(
        new URL(
          "../../src/trading/shell/IslandSidebar.tsx",
          import.meta.url
        ),
        "utf8"
      );

    assert.match(
      workspace,
      /activeSection === "wallet"/
    );

    assert.match(
      workspace,
      /<WalletWorkspace/
    );

    assert.match(
      sidebar,
      /id:\s*"wallet"/
    );

    assert.doesNotMatch(
      walletWorkspace,
      /window\.ethereum|globalThis\.ethereum|eth_requestAccounts|wallet_switchEthereumChain/
    );

    assert.doesNotMatch(
      walletWorkspace,
      /eth_sendTransaction|sendTransaction|submitTransaction/
    );
  }
);
