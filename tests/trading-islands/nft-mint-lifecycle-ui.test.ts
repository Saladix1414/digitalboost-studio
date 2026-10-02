import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    "src/trading/nft/mint/NftMintWorkspace.tsx",
    "utf8"
  );

test(
  "mint UI uses hardened replay-protected verification",
  () => {
    assert.match(
      workspace,
      /verifyNftMintWithReplayProtection/
    );

    assert.doesNotMatch(
      workspace,
      /confirmAndVerifyNftMint/
    );
  }
);

test(
  "mint UI exposes deterministic failure scenarios",
  () => {
    for (const scenario of [
      "FAILED_RECEIPT",
      "MISSING_EVENT",
      "OWNER_MISMATCH",
      "METADATA_MISMATCH",
    ]) {
      assert.match(
        workspace,
        new RegExp(scenario)
      );
    }
  }
);

test(
  "failed verification states do not claim evidence",
  () => {
    assert.match(
      workspace,
      /Verification failed\. No\s+evidence claim was created\./
    );
  }
);

test(
  "mint UI surfaces replay protection",
  () => {
    assert.match(
      workspace,
      /replay protection:on/
    );

    assert.match(
      workspace,
      /securityError/
    );
  }
);

test(
  "mint UI preserves explicit authority boundaries",
  () => {
    assert.match(
      workspace,
      /submitted ≠ verified/
    );

    assert.match(
      workspace,
      /txHash ≠ authority/
    );

    assert.match(
      workspace,
      /DBX settlement:none/
    );

    assert.match(
      workspace,
      /RPC:none/
    );
  }
);

test(
  "mint UI still contains no real blockchain execution",
  () => {
    assert.doesNotMatch(
      workspace,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      workspace,
      /WebSocket/
    );

    assert.doesNotMatch(
      workspace,
      /ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      workspace,
      /eth_sendTransaction/
    );

    assert.doesNotMatch(
      workspace,
      /eth_sendRawTransaction/
    );
  }
);
