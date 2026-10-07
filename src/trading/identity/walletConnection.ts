import {
  createWalletAddress,
  createWalletChain,
  createWalletConnection,
  createWalletIdentity,
  disconnectWalletConnection,
  sameWalletChain,
} from "./wallet.ts";

import type {
  WalletConnection,
  WalletConnectionId,
  WalletId,
  WalletIdentity,
} from "./walletTypes.ts";

export type WalletProviderAccount = {
  readonly address:
    string;
};

export type WalletConnectorPort = {
  /**
   * Requests account access from a wallet provider.
   *
   * This port has no trading or transaction execution
   * methods by design.
   */
  requestAccounts():
    Promise<
      readonly WalletProviderAccount[]
    >;

  getChainId():
    Promise<number>;

  switchChain?(
    chainId: number
  ): Promise<void>;
};

export type WalletConnectionFailureCode =
  | "PROVIDER_UNAVAILABLE"
  | "NO_ACCOUNTS"
  | "UNSUPPORTED_NETWORK"
  | "CHAIN_SWITCH_UNAVAILABLE"
  | "CHAIN_SWITCH_FAILED"
  | "CONNECTION_FAILED"
  | "SESSION_EXPIRED";

export type WalletConnectionFailure = {
  readonly ok:
    false;

  readonly code:
    WalletConnectionFailureCode;

  readonly message:
    string;

  readonly grantsAuthority:
    false;
};

export type WalletConnectionSuccess = {
  readonly ok:
    true;

  readonly wallet:
    WalletIdentity;

  readonly connection:
    WalletConnection;

  readonly grantsAuthority:
    false;
};

export type WalletConnectionResult =
  | WalletConnectionSuccess
  | WalletConnectionFailure;

export type ConnectWalletInput = {
  readonly connector:
    WalletConnectorPort;

  readonly walletId:
    WalletId;

  readonly connectionId:
    WalletConnectionId;

  readonly supportedChainIds:
    readonly number[];

  readonly connectedAt:
    string;
};

export type SwitchWalletChainInput = {
  readonly connector:
    WalletConnectorPort;

  readonly wallet:
    WalletIdentity;

  readonly targetChainId:
    number;

  readonly supportedChainIds:
    readonly number[];
};

function supportedChains(
  values:
    readonly number[]
): readonly number[] {
  return [
    ...new Set(
      values.filter(
        (value) =>
          Number.isSafeInteger(value) &&
          value > 0
      )
    ),
  ].sort(
    (left, right) =>
      left - right
  );
}

function failure(
  code:
    WalletConnectionFailureCode,
  message:
    string
): WalletConnectionFailure {
  return {
    ok:
      false,

    code,

    message,

    grantsAuthority:
      false,
  };
}

export async function connectWallet(
  input:
    ConnectWalletInput
): Promise<WalletConnectionResult> {
  const supported =
    supportedChains(
      input.supportedChainIds
    );

  if (
    supported.length === 0
  ) {
    return failure(
      "UNSUPPORTED_NETWORK",
      "No supported wallet networks are configured."
    );
  }

  try {
    const accounts =
      await input.connector.requestAccounts();

    const first =
      accounts[0];

    if (!first) {
      return failure(
        "NO_ACCOUNTS",
        "Wallet provider returned no accounts."
      );
    }

    const chainId =
      await input.connector.getChainId();

    if (
      !supported.includes(
        chainId
      )
    ) {
      return failure(
        "UNSUPPORTED_NETWORK",
        `Wallet network ${chainId} is not supported.`
      );
    }

    const wallet =
      createWalletIdentity({
        walletId:
          input.walletId,

        address:
          createWalletAddress(
            first.address
          ),

        chain:
          createWalletChain(
            chainId
          ),

        createdAt:
          input.connectedAt,
      });

    const connection =
      createWalletConnection({
        connectionId:
          input.connectionId,

        wallet,

        connectedAt:
          input.connectedAt,
      });

    return {
      ok:
        true,

      wallet,

      connection,

      grantsAuthority:
        false,
    };
  } catch (error) {
    return failure(
      "CONNECTION_FAILED",
      error instanceof Error
        ? error.message
        : "Wallet connection failed."
    );
  }
}

export async function switchWalletChain(
  input:
    SwitchWalletChainInput
): Promise<
  | {
      readonly ok: true;
      readonly wallet:
        WalletIdentity;
      readonly grantsAuthority:
        false;
    }
  | WalletConnectionFailure
> {
  const supported =
    supportedChains(
      input.supportedChainIds
    );

  if (
    !supported.includes(
      input.targetChainId
    )
  ) {
    return failure(
      "UNSUPPORTED_NETWORK",
      `Wallet network ${input.targetChainId} is not supported.`
    );
  }

  if (
    !input.connector.switchChain
  ) {
    return failure(
      "CHAIN_SWITCH_UNAVAILABLE",
      "Wallet provider does not support controlled chain switching."
    );
  }

  try {
    await input.connector.switchChain(
      input.targetChainId
    );

    const observedChainId =
      await input.connector.getChainId();

    if (
      observedChainId !==
      input.targetChainId
    ) {
      return failure(
        "CHAIN_SWITCH_FAILED",
        "Wallet provider did not confirm the requested network."
      );
    }

    return {
      ok:
        true,

      wallet: {
        ...input.wallet,

        chain:
          createWalletChain(
            observedChainId
          ),
      },

      grantsAuthority:
        false,
    };
  } catch (error) {
    return failure(
      "CHAIN_SWITCH_FAILED",
      error instanceof Error
        ? error.message
        : "Wallet chain switch failed."
    );
  }
}

export function disconnectWallet(
  connection:
    WalletConnection,
  disconnectedAt:
    string
): WalletConnection {
  return disconnectWalletConnection(
    connection,
    disconnectedAt
  );
}

export function walletConnectionMatchesWallet(
  connection:
    WalletConnection,
  wallet:
    WalletIdentity
): boolean {
  return (
    connection.walletId ===
      wallet.walletId &&
    connection.state ===
      "connected" &&
    sameWalletChain(
      connection.chain,
      wallet.chain
    )
  );
}

export function expireWalletConnection(
  connection:
    WalletConnection,
  expiredAt:
    string
): WalletConnection {
  const disconnected =
    disconnectWalletConnection(
      connection,
      expiredAt
    );

  return {
    ...disconnected,

    state:
      "expired",

    provesOwnership:
      false,

    grantsAuthority:
      false,
  };
}
