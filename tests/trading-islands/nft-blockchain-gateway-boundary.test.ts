import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/blockchain/types.ts",
  "src/trading/nft/blockchain/stateMachine.ts",
  "src/trading/nft/blockchain/gateway.ts",
  "src/trading/nft/blockchain/fixtures.ts",
];

const content =
  files
    .map(
      (file) =>
        fs.readFileSync(
          file,
          "utf8"
        )
    )
    .join("\n");

test(
  "Phase 30A contains no real blockchain client",
  () => {
    assert.doesNotMatch(
      content,
      /ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /WebSocket/
    );

    assert.doesNotMatch(
      content,
      /eth_sendTransaction/
    );

    assert.doesNotMatch(
      content,
      /eth_sendRawTransaction/
    );
  }
);

test(
  "Phase 30A cannot claim execution or authority",
  () => {
    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /paymentExecuted\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /ownershipTransferred\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /walletSigned\s*:\s*true/
    );
  }
);
