import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/dna/lineage.ts",
  "src/trading/nft/dna/lineageValidation.ts",
  "src/trading/nft/dna/snapshot.ts",
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
  "DNA lineage has no execution capability",
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
  }
);

test(
  "DNA lineage remains explicitly non-authoritative",
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
  "DNA lineage does not claim provenance or ownership authority",
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
