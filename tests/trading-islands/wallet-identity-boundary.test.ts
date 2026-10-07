import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function source(
  name: string
): string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/identity/${name}`,
      import.meta.url
    ),
    "utf8"
  );
}

const combined = [
  source("walletTypes.ts"),
  source("wallet.ts"),
].join("\n");

test(
  "wallet model performs no browser wallet connection",
  () => {
    assert.doesNotMatch(
      combined,
      /window\.ethereum|eth_requestAccounts|accountsChanged|chainChanged/
    );
  }
);

test(
  "wallet model performs no RPC or transaction submission",
  () => {
    assert.doesNotMatch(
      combined,
      /fetch\s*\(|WebSocket|eth_sendTransaction|sendTransaction|submitTransaction/
    );
  }
);

test(
  "wallet model has no wallet libraries",
  () => {
    assert.doesNotMatch(
      combined,
      /\bWalletConnect\b|\bMetaMask\b|from\s+["'][^"']*(?:ethers|wagmi|viem)[^"']*["']/
    );
  }
);

test(
  "wallet model does not persist raw signatures",
  () => {
    assert.match(
      combined,
      /signatureStored:\s*false/
    );

    assert.doesNotMatch(
      combined,
      /rawSignature|signature:\s*string/
    );
  }
);

test(
  "wallet connection, proof and binding remain non authoritative",
  () => {
    assert.match(
      combined,
      /provesOwnership:\s*false/
    );

    assert.match(
      combined,
      /grantsAuthority:\s*false/
    );

    assert.doesNotMatch(
      combined,
      /authoritative:\s*true/
    );
  }
);

test(
  "wallet model does not replace canonical user identity",
  () => {
    const types =
      source("walletTypes.ts");

    assert.doesNotMatch(
      types,
      /type UserId\s*=/
    );

    assert.doesNotMatch(
      types,
      /type TenantId\s*=/
    );
  }
);

test(
  "wallet model has no client persistence",
  () => {
    assert.doesNotMatch(
      combined,
      /localStorage|sessionStorage|indexedDB|BroadcastChannel/
    );
  }
);
