import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const content =
  fs.readFileSync(
    new URL(
      "../../src/trading/identity/security.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "security layer performs no external execution",
  () => {
    assert.doesNotMatch(
      content,
      /fetch\s*\(|WebSocket|XMLHttpRequest/
    );
  }
);

test(
  "security layer performs no blockchain execution",
  () => {
    assert.doesNotMatch(
      content,
      /eth_sendTransaction|sendTransaction|submitTransaction|requestAccounts|switchChain/
    );
  }
);

test(
  "security layer never grants authority",
  () => {
    assert.match(
      content,
      /grantsAuthority:\s*false/
    );

    assert.doesNotMatch(
      content,
      /grantsAuthority:\s*true|authoritative:\s*true/
    );
  }
);

test(
  "security layer does not depend on browser persistence",
  () => {
    assert.doesNotMatch(
      content,
      /localStorage|sessionStorage|indexedDB|BroadcastChannel/
    );
  }
);

test(
  "security layer has explicit replay and cross-tenant defenses",
  () => {
    assert.match(
      content,
      /PROOF_REPLAY/
    );

    assert.match(
      content,
      /TENANT_MISMATCH/
    );

    assert.match(
      content,
      /CHAIN_MISMATCH/
    );

    assert.match(
      content,
      /SESSION_MISMATCH/
    );
  }
);
