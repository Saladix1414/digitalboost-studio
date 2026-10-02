import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/detail/types.ts",
  "src/trading/nft/detail/builder.ts",
  "src/trading/nft/detail/validation.ts",
  "src/trading/nft/detail/lookup.ts",
  "src/trading/nft/detail/evidence.ts",
  "src/trading/nft/detail/consistency.ts",
  "src/trading/nft/detail/NftDetailWorkspace.tsx",
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
  "Phase 28 performs no external blockchain execution",
  () => {
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
      /ethers|viem|wagmi/i
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
  "Phase 28 cannot escalate ownership authenticity payment or authority",
  () => {
    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /ownershipVerified\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /absoluteAuthenticity\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /paymentExecuted\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /settlementVerified\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /legalTitle\s*:\s*true/
    );
  }
);
