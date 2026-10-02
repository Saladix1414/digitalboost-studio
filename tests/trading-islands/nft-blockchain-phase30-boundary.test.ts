import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/blockchain/gateway.ts",
  "src/trading/nft/blockchain/simulation.ts",
  "src/trading/nft/blockchain/sendPreparation.ts",
  "src/trading/nft/blockchain/pipeline.ts",
  "src/trading/nft/blockchain/submission.ts",
  "src/trading/nft/blockchain/verification.ts",
  "src/trading/nft/blockchain/indexing.ts",
  "src/trading/nft/blockchain/evidencePipeline.ts",
  "src/trading/nft/blockchain/retry.ts",
  "src/trading/nft/blockchain/fallback.ts",
  "src/trading/nft/blockchain/recovery.ts",
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
  "Phase 30 contains no live blockchain client",
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
  "Phase 30 cannot claim financial ownership or governance authority",
  () => {
    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /walletSigned\s*:\s*true/
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
      /legalTitle\s*:\s*true/
    );
  }
);
