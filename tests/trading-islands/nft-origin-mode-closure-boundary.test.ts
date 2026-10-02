import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const content =
  fs.readFileSync(
    "src/trading/nft/origin/modeClosure.ts",
    "utf8"
  );

test(
  "Origin mode closure contains no external execution",
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
  "Origin mode closure cannot claim provenance ownership or authenticity",
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
      /authenticityVerified\s*:\s*true/
    );
  }
);
