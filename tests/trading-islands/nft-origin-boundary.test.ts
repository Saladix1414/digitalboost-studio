import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/origin/types.ts",
  "src/trading/nft/origin/builder.ts",
  "src/trading/nft/origin/validation.ts",
  "src/trading/nft/origin/stateMachine.ts",
  "src/trading/nft/origin/engine.ts",
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
  "origin domain performs no blockchain execution",
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
  "origin domain remains non-authoritative",
  () => {
    assert.match(
      content,
      /authoritative:\s*false/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);

test(
  "origin domain does not claim provenance or ownership",
  () => {
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
      /authenticityVerified\s*:\s*true/
    );
  }
);
