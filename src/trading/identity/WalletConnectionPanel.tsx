import type {
  WalletConnection,
  WalletIdentity,
} from "./walletTypes.ts";

type WalletConnectionPanelProps = {
  readonly wallet:
    WalletIdentity | null;

  readonly connection:
    WalletConnection | null;

  readonly supportedChainIds:
    readonly number[];

  readonly busy?:
    boolean;

  readonly error?:
    string | null;

  readonly onConnect:
    () => void;

  readonly onDisconnect:
    () => void;

  readonly onSwitchChain:
    (
      chainId: number
    ) => void;
};

export function WalletConnectionPanel({
  wallet,
  connection,
  supportedChainIds,
  busy = false,
  error = null,
  onConnect,
  onDisconnect,
  onSwitchChain,
}: WalletConnectionPanelProps) {
  const connected =
    connection?.state ===
      "connected" &&
    wallet !== null;

  return (
    <section
      aria-labelledby="wallet-connection-title"
      className="rounded-xl border border-white/10 bg-[#0B1018] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="wallet-connection-title"
            className="text-sm font-semibold text-white"
          >
            Wallet
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Connection status only. Wallet connection does not grant trading authority.
          </p>
        </div>

        <span
          className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300"
          aria-live="polite"
        >
          {connected
            ? "Connected"
            : connection?.state ??
              "Disconnected"}
        </span>
      </div>

      {wallet && (
        <dl className="mt-4 grid gap-2 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">
              Wallet
            </dt>

            <dd className="truncate text-slate-200">
              {wallet.walletId}
            </dd>
          </div>

          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">
              Address
            </dt>

            <dd className="max-w-[15rem] truncate font-mono text-slate-200">
              {wallet.address}
            </dd>
          </div>

          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">
              Network
            </dt>

            <dd className="text-slate-200">
              {wallet.chain.namespace}
            </dd>
          </div>
        </dl>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-200"
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!connected ? (
          <button
            type="button"
            disabled={busy}
            onClick={onConnect}
            className="min-h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#061018] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy
              ? "Connecting…"
              : "Connect wallet"}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={onDisconnect}
            className="min-h-11 rounded-lg border border-white/10 px-4 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Disconnect
          </button>
        )}

        {connected &&
          supportedChainIds
            .filter(
              (chainId) =>
                chainId !==
                wallet?.chain.chainId
            )
            .map(
              (chainId) => (
                <button
                  key={chainId}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    onSwitchChain(
                      chainId
                    )
                  }
                  className="min-h-11 rounded-lg border border-cyan-400/20 px-3 text-xs text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Switch to {chainId}
                </button>
              )
            )}
      </div>
    </section>
  );
}

export default WalletConnectionPanel;
