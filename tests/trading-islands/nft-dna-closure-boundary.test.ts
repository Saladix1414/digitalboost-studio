import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/dna/consistency.ts",
  "src/trading/nft/dna/closure.ts",
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
  "DNA closure performs no external execution",
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
  "DNA closure introduces no authority escalation",
  () => {
    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /provenanceVerified\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /ownershipVerified\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /governanceAuthority/
    );
  }
);
