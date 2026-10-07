import {
  useState,
} from "react";

import {
  WalletConnectionPanel,
} from "./WalletConnectionPanel";

import {
  connectWallet,
  disconnectWallet,
  switchWalletChain,
} from "./walletConnection";

import {
  createWalletConnectionId,
  createWalletId,
} from "./wallet";

import type {
  WalletConnection,
  WalletIdentity,
} from "./walletTypes";

import type {
  WalletConnectorPort,
} from "./walletConnection";

const SUPPORTED_CHAIN_IDS =
  [1, 137] as const;

const CONNECTED_AT =
  "2026-10-07T18:00:00.000Z";

const DISCONNECTED_AT =
  "2026-10-07T18:05:00.000Z";

/**
 * Phase 33H uses a deterministic local connector.
 *
 * It does not access browser wallet provider globals and does not
 * represent a production wallet provider integration.
 */
function createDeterministicWalletConnector():
  WalletConnectorPort {
  let chainId =
    137;

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

export function WalletWorkspace() {
  const [
    wallet,
    setWallet,
  ] =
    useState<WalletIdentity | null>(
      null
    );

  const [
    connection,
    setConnection,
  ] =
    useState<WalletConnection | null>(
      null
    );

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    connector,
  ] =
    useState(
      () =>
        createDeterministicWalletConnector()
    );

  async function handleConnect() {
    setBusy(true);
    setError(null);

    try {
      const result =
        await connectWallet({
          connector,

          walletId:
            createWalletId(
              "wal_workspace001"
            ),

          connectionId:
            createWalletConnectionId(
              "wcn_workspace001"
            ),

          supportedChainIds:
            SUPPORTED_CHAIN_IDS,

          connectedAt:
            CONNECTED_AT,
        });

      if (!result.ok) {
        setError(
          result.message
        );

        return;
      }

      setWallet(
        result.wallet
      );

      setConnection(
        result.connection
      );
    } finally {
      setBusy(false);
    }
  }

  function handleDisconnect() {
    if (!connection) {
      return;
    }

    const nextConnection =
      disconnectWallet(
        connection,
        DISCONNECTED_AT
      );

    setConnection(
      nextConnection
    );
  }

  async function handleSwitchChain(
    chainId:
      number
  ) {
    if (!wallet) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const result =
        await switchWalletChain({
          connector,

          wallet,

          targetChainId:
            chainId,

          supportedChainIds:
            SUPPORTED_CHAIN_IDS,
        });

      if (!result.ok) {
        setError(
          result.message
        );

        return;
      }

      setWallet(
        result.wallet
      );

      if (
        connection &&
        connection.state ===
          "connected"
      ) {
        setConnection({
          ...connection,

          chain:
            result.wallet.chain,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  const connected =
    connection?.state ===
      "connected" &&
    wallet !== null;

  return (
    <div className="ti-wallet-workspace">
      <div className="ti-wallet-workspace__grid">
        <section className="ti-card">
          <div className="ti-label">
            Identity context
          </div>

          <h2 className="ti-card__title">
            Canonical identity boundary
          </h2>

          <p className="ti-card__description">
            Wallet state is descriptive context only.
            Connection, ownership evidence and signatures do not grant unrestricted authority.
          </p>

          <div className="ti-wallet-workspace__facts">
            <div>
              <span>
                Identity source
              </span>

              <strong>
                Server policy boundary
              </strong>
            </div>

            <div>
              <span>
                Wallet binding
              </span>

              <strong>
                Not established
              </strong>
            </div>

            <div>
              <span>
                Authorization
              </span>

              <strong>
                Independent
              </strong>
            </div>
          </div>
        </section>

        <WalletConnectionPanel
          wallet={wallet}
          connection={connection}
          supportedChainIds={
            SUPPORTED_CHAIN_IDS
          }
          busy={busy}
          error={error}
          onConnect={
            handleConnect
          }
          onDisconnect={
            handleDisconnect
          }
          onSwitchChain={
            handleSwitchChain
          }
        />
      </div>

      <section className="ti-card ti-wallet-workspace__status">
        <div className="ti-label">
          Security state
        </div>

        <div className="ti-wallet-workspace__facts">
          <div>
            <span>
              Connection
            </span>

            <strong>
              {connected
                ? "Connected"
                : "Disconnected"}
            </strong>
          </div>

          <div>
            <span>
              Ownership proof
            </span>

            <strong>
              Not verified
            </strong>
          </div>

          <div>
            <span>
              Authority
            </span>

            <strong>
              Not granted
            </strong>
          </div>

          <div>
            <span>
              Provider
            </span>

            <strong>
              Deterministic local
            </strong>
          </div>
        </div>

        <p className="ti-wallet-workspace__notice">
          MOCK CONNECTION · NON-AUTHORITATIVE · NO TRANSACTION EXECUTION
        </p>
      </section>
    </div>
  );
}

export default WalletWorkspace;
