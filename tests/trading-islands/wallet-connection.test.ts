import assert from "node:assert/strict";
import test from "node:test";

import {
  connectWallet,
  createWalletConnectionId,
  createWalletId,
  disconnectWallet,
  expireWalletConnection,
  switchWalletChain,
  walletConnectionMatchesWallet,
} from "../../src/trading/identity/index.ts";

import type {
  WalletConnectorPort,
} from "../../src/trading/identity/index.ts";

const NOW =
  "2026-10-07T16:00:00.000Z";

const LATER =
  "2026-10-07T16:05:00.000Z";

function connector(
  options: {
    accounts?: readonly string[];
    chainId?: number;
    switchable?: boolean;
  } = {}
): WalletConnectorPort {
  let chainId =
    options.chainId ?? 137;

  const port: WalletConnectorPort = {
    async requestAccounts() {
      return (
        options.accounts ?? [
          "0x1111111111111111111111111111111111111111",
        ]
      ).map(
        (address) => ({
          address,
        })
      );
    },

    async getChainId() {
      return chainId;
    },
  };

  if (
    options.switchable !== false
  ) {
    return {
      ...port,

      async switchChain(
        nextChainId: number
      ) {
        chainId =
          nextChainId;
      },
    };
  }

  return port;
}

test(
  "connect wallet creates descriptive connection on supported chain",
  async () => {
    const result =
      await connectWallet({
        connector:
          connector(),

        walletId:
          createWalletId(
            "wal_primary001"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_primary001"
          ),

        supportedChainIds:
          [1, 137],

        connectedAt:
          NOW,
      });

    assert.equal(
      result.ok,
      true
    );

    if (!result.ok) {
      return;
    }

    assert.equal(
      result.wallet.chain.chainId,
      137
    );

    assert.equal(
      result.connection.state,
      "connected"
    );

    assert.equal(
      result.connection.provesOwnership,
      false
    );

    assert.equal(
      result.grantsAuthority,
      false
    );
  }
);

test(
  "unsupported network fails closed",
  async () => {
    const result =
      await connectWallet({
        connector:
          connector({
            chainId:
              999999,
          }),

        walletId:
          createWalletId(
            "wal_primary001"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_primary001"
          ),

        supportedChainIds:
          [1, 137],

        connectedAt:
          NOW,
      });

    assert.equal(
      result.ok,
      false
    );

    if (result.ok) {
      return;
    }

    assert.equal(
      result.code,
      "UNSUPPORTED_NETWORK"
    );

    assert.equal(
      result.grantsAuthority,
      false
    );
  }
);

test(
  "provider returning no account fails",
  async () => {
    const result =
      await connectWallet({
        connector:
          connector({
            accounts: [],
          }),

        walletId:
          createWalletId(
            "wal_primary001"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_primary001"
          ),

        supportedChainIds:
          [137],

        connectedAt:
          NOW,
      });

    assert.equal(
      result.ok,
      false
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "NO_ACCOUNTS"
      );
    }
  }
);

test(
  "controlled chain switch verifies resulting chain",
  async () => {
    const port =
      connector();

    const connected =
      await connectWallet({
        connector:
          port,

        walletId:
          createWalletId(
            "wal_primary001"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_primary001"
          ),

        supportedChainIds:
          [1, 137],

        connectedAt:
          NOW,
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
        connector:
          port,

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

    assert.equal(
      switched.grantsAuthority,
      false
    );
  }
);

test(
  "unsupported chain switch is rejected before provider call",
  async () => {
    const connected =
      await connectWallet({
        connector:
          connector(),

        walletId:
          createWalletId(
            "wal_primary001"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_primary001"
          ),

        supportedChainIds:
          [137],

        connectedAt:
          NOW,
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
        connector:
          connector(),

        wallet:
          connected.wallet,

        targetChainId:
          999,

        supportedChainIds:
          [137],
      });

    assert.equal(
      switched.ok,
      false
    );

    if (!switched.ok) {
      assert.equal(
        switched.code,
        "UNSUPPORTED_NETWORK"
      );
    }
  }
);

test(
  "disconnect preserves non-authoritative connection record",
  async () => {
    const result =
      await connectWallet({
        connector:
          connector(),

        walletId:
          createWalletId(
            "wal_primary001"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_primary001"
          ),

        supportedChainIds:
          [137],

        connectedAt:
          NOW,
      });

    assert.equal(
      result.ok,
      true
    );

    if (!result.ok) {
      return;
    }

    const disconnected =
      disconnectWallet(
        result.connection,
        LATER
      );

    assert.equal(
      disconnected.state,
      "disconnected"
    );

    assert.equal(
      disconnected.grantsAuthority,
      false
    );
  }
);

test(
  "expired wallet session no longer matches connected wallet",
  async () => {
    const result =
      await connectWallet({
        connector:
          connector(),

        walletId:
          createWalletId(
            "wal_primary001"
          ),

        connectionId:
          createWalletConnectionId(
            "wcn_primary001"
          ),

        supportedChainIds:
          [137],

        connectedAt:
          NOW,
      });

    assert.equal(
      result.ok,
      true
    );

    if (!result.ok) {
      return;
    }

    assert.equal(
      walletConnectionMatchesWallet(
        result.connection,
        result.wallet
      ),
      true
    );

    const expired =
      expireWalletConnection(
        result.connection,
        LATER
      );

    assert.equal(
      expired.state,
      "expired"
    );

    assert.equal(
      walletConnectionMatchesWallet(
        expired,
        result.wallet
      ),
      false
    );
  }
);
