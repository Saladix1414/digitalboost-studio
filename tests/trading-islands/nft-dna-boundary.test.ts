import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/dna/types.ts",
  "src/trading/nft/dna/hash.ts",
  "src/trading/nft/dna/builder.ts",
  "src/trading/nft/dna/validation.ts",
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
  "DNA layers remain explicitly non-authoritative",
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
  "DNA domain performs no blockchain execution",
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
  "blockchain proof is gated by VERIFIED mint status",
  () => {
    const builder =
      fs.readFileSync(
        "src/trading/nft/dna/builder.ts",
        "utf8"
      );

    assert.match(
      builder,
      /mintRecord\.status !==\s*"VERIFIED"/
    );

    assert.match(
      builder,
      /verification\s*\?\.\s*verified !== true/
    );
  }
);

test(
  "DNA does not introduce provenance authority",
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
      /governanceAuthority/
    );
  }
);
