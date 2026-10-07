import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const content =
  fs.readFileSync(
    new URL(
      "../../src/trading/identity/userContext.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "user context has no browser persistence authority",
  () => {
    assert.doesNotMatch(
      content,
      /localStorage|sessionStorage|indexedDB|BroadcastChannel/
    );
  }
);

test(
  "user context does not connect wallets",
  () => {
    assert.doesNotMatch(
      content,
      /window\.ethereum|eth_requestAccounts|eth_sendTransaction|WalletConnect|ethers|wagmi|viem/
    );
  }
);

test(
  "user context cannot execute trading or blockchain operations",
  () => {
    assert.doesNotMatch(
      content,
      /runBotRuntimeSession|executePaperOrder|fillPaperMarketOrder|sendTransaction|submitTransaction/
    );
  }
);

test(
  "user context cannot manufacture caller supplied roles or capabilities",
  () => {
    assert.doesNotMatch(
      content,
      /CreateTradingUserContextInput[\s\S]*readonly roles\s*:/
    );

    assert.doesNotMatch(
      content,
      /CreateTradingUserContextInput[\s\S]*readonly capabilities\s*:/
    );
  }
);

test(
  "user context explicitly remains non authoritative",
  () => {
    assert.match(
      content,
      /grantsAuthority:\s*false/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);
