import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/provenance/types.ts",
  "src/trading/nft/provenance/builder.ts",
  "src/trading/nft/provenance/validation.ts",
  "src/trading/nft/provenance/evidence.ts",
  "src/trading/nft/provenance/link.ts",
];

const content =
  files
    .map(
      (path) =>
        fs.readFileSync(
          path,
          "utf8"
        )
    )
    .join("\n");

test(
  "provenance foundation performs no external execution",
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
  "provenance foundation cannot escalate authority",
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
      /authenticityVerified\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /legalOwnership\s*:\s*true/
    );
  }
);
