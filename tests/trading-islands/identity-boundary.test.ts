import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function source(
  relative:
    string
): string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/identity/${relative}`,
      import.meta.url
    ),
    "utf8"
  );
}

test(
  "identity foundation has no client persistence authority",
  () => {
    const combined = [
      source("types.ts"),
      source("ids.ts"),
      source("context.ts"),
    ].join("\n");

    assert.doesNotMatch(
      combined,
      /localStorage|sessionStorage|indexedDB|BroadcastChannel/
    );
  }
);

test(
  "identity foundation does not connect wallet or RPC",
  () => {
    const combined = [
      source("types.ts"),
      source("ids.ts"),
      source("context.ts"),
    ].join("\n");

    assert.doesNotMatch(
      combined,
      /window\.ethereum|eth_requestAccounts|walletConnect|WalletConnect|ethers|wagmi|viem/
    );
  }
);

test(
  "identity foundation performs no privileged execution",
  () => {
    const combined = [
      source("types.ts"),
      source("ids.ts"),
      source("context.ts"),
    ].join("\n");

    assert.doesNotMatch(
      combined,
      /executePaperOrder|fillPaperMarketOrder|runBotRuntimeSession/
    );

    assert.doesNotMatch(
      combined,
      /authoritative:\s*true/
    );
  }
);

test(
  "runtime session identity remains owned by runtime domain",
  () => {
    const runtime =
      fs.readFileSync(
        new URL(
          "../../src/trading/runtime/sessionIdentity.ts",
          import.meta.url
        ),
        "utf8"
      );

    assert.match(
      runtime,
      /createRuntimeSessionId/
    );

    assert.match(
      runtime,
      /crypto\.randomUUID/
    );

    assert.doesNotMatch(
      runtime,
      /UserId|TenantId|AuthorizationContext/
    );
  }
);
