import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    new URL(
      "../../src/trading/TradingIslandsWorkspace.tsx",
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

const walletWorkspace =
  fs.readFileSync(
    new URL(
      "../../src/trading/identity/WalletWorkspace.tsx",
      import.meta.url
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    new URL(
      "../../src/trading/trading-islands.css",
      import.meta.url
    ),
    "utf8"
  );

test(
  "wallet is canonical Trading Islands navigation",
  () => {
    assert.match(
      sidebar,
      /\|\s*"wallet"/
    );

    assert.match(
      sidebar,
      /id:\s*"wallet"/
    );

    assert.match(
      sidebar,
      /label:\s*"Wallet"/
    );

    assert.match(
      workspace,
      /wallet:\s*\{/
    );

    assert.match(
      workspace,
      /activeSection === "wallet"/
    );

    assert.match(
      workspace,
      /<WalletWorkspace/
    );
  }
);

test(
  "Overview remains initial screen",
  () => {
    assert.match(
      workspace,
      /useState<TradingSection>\(\s*"overview"\s*\)/
    );

    assert.match(
      workspace,
      /<TradingOverview/
    );
  }
);

test(
  "wallet workspace uses canonical connection controller",
  () => {
    assert.match(
      walletWorkspace,
      /connectWallet/
    );

    assert.match(
      walletWorkspace,
      /disconnectWallet/
    );

    assert.match(
      walletWorkspace,
      /switchWalletChain/
    );

    assert.match(
      walletWorkspace,
      /WalletConnectionPanel/
    );
  }
);

test(
  "wallet workspace has no direct browser provider",
  () => {
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

test(
  "wallet workspace remains non authoritative",
  () => {
    assert.match(
      walletWorkspace,
      /NON-AUTHORITATIVE/
    );

    assert.match(
      walletWorkspace,
      /Not granted/
    );

    assert.match(
      walletWorkspace,
      /MOCK CONNECTION/
    );
  }
);

test(
  "Phase 33H CSS preserves global shell geometry",
  () => {
    const marker =
      css.indexOf(
        "PHASE 33H — WALLET WORKSPACE"
      );

    assert.notEqual(
      marker,
      -1
    );

    const phase33h =
      css.slice(marker);

    assert.match(
      phase33h,
      /@media \(max-width: 840px\)/
    );

    assert.doesNotMatch(
      phase33h,
      /100vh|100dvh|position:\s*fixed|overflow:\s*hidden/
    );
  }
);
