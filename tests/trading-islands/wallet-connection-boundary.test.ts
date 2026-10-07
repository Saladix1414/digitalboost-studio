import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const controller =
  fs.readFileSync(
    new URL(
      "../../src/trading/identity/walletConnection.ts",
      import.meta.url
    ),
    "utf8"
  );

const panel =
  fs.readFileSync(
    new URL(
      "../../src/trading/identity/WalletConnectionPanel.tsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "wallet connection controller has no transaction execution surface",
  () => {
    assert.doesNotMatch(
      controller,
      /eth_sendTransaction|sendTransaction|submitTransaction|executePaperOrder|runBotRuntimeSession/
    );
  }
);

test(
  "wallet UI does not access browser provider directly",
  () => {
    assert.doesNotMatch(
      panel,
      /window\.ethereum|globalThis\.ethereum|eth_requestAccounts|wallet_switchEthereumChain/
    );
  }
);

test(
  "wallet connection domain remains non authoritative",
  () => {
    assert.match(
      controller,
      /grantsAuthority:\s*false/
    );

    assert.doesNotMatch(
      controller,
      /authoritative:\s*true/
    );
  }
);

test(
  "connector port contains no arbitrary RPC request method",
  () => {
    assert.doesNotMatch(
      controller,
      /request\s*\(\s*\{/
    );

    assert.match(
      controller,
      /requestAccounts/
    );

    assert.match(
      controller,
      /getChainId/
    );
  }
);

test(
  "isolated wallet panel is not wired into trading shell yet",
  () => {
    const workspace =
      fs.readFileSync(
        new URL(
          "../../src/trading/TradingIslandsWorkspace.tsx",
          import.meta.url
        ),
        "utf8"
      );

    assert.doesNotMatch(
      workspace,
      /WalletConnectionPanel/
    );
  }
);
