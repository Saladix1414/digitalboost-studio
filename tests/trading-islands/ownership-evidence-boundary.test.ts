import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const content =
  fs.readFileSync(
    new URL(
      "../../src/trading/identity/ownershipEvidence.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "ownership evidence performs no direct blockchain access",
  () => {
    assert.doesNotMatch(
      content,
      /window\.ethereum|eth_call|eth_getBalance|fetch\s*\(|WebSocket|JsonRpcProvider/
    );
  }
);

test(
  "ownership evidence cannot execute transactions",
  () => {
    assert.doesNotMatch(
      content,
      /eth_sendTransaction|sendTransaction|submitTransaction|executePaperOrder|runBotRuntimeSession/
    );
  }
);

test(
  "ownership evidence explicitly grants no authority",
  () => {
    assert.match(
      content,
      /grantsAuthority:\s*false/
    );

    assert.doesNotMatch(
      content,
      /grantsAuthority:\s*true/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);

test(
  "blockchain evidence makes no legal ownership claim",
  () => {
    assert.match(
      content,
      /claimsLegalOwnership:\s*false/
    );

    assert.doesNotMatch(
      content,
      /claimsLegalOwnership:\s*true/
    );
  }
);

test(
  "ownership model uses integer quantities instead of number balances",
  () => {
    assert.match(
      content,
      /readonly quantity:\s*string/
    );

    assert.doesNotMatch(
      content,
      /readonly quantity:\s*number/
    );
  }
);

test(
  "ownership evidence has no browser persistence",
  () => {
    assert.doesNotMatch(
      content,
      /localStorage|sessionStorage|indexedDB|BroadcastChannel/
    );
  }
);
