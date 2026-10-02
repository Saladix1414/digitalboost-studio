import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/mint/evidenceRegistry.ts",
  "src/trading/nft/mint/hardenedVerification.ts",
  "src/trading/nft/mint/evidenceRegistryFactory.ts",
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
  "mint hardening has no external execution capability",
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
  "mint evidence claims remain explicitly non-authoritative",
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
  "replay protection precedes verified evidence claim",
  () => {
    const hardened =
      fs.readFileSync(
        "src/trading/nft/mint/hardenedVerification.ts",
        "utf8"
      );

    const inspectIndex =
      hardened.indexOf(
        "inspectMintEvidenceSecurity"
      );

    const verifyIndex =
      hardened.indexOf(
        "confirmAndVerifyNftMint"
      );

    const claimIndex =
      hardened.lastIndexOf(
        "claimMintEvidence"
      );

    assert.ok(
      inspectIndex >= 0
    );

    assert.ok(
      verifyIndex >= 0
    );

    assert.ok(
      claimIndex >= 0
    );

    assert.ok(
      inspectIndex <
      verifyIndex
    );

    assert.ok(
      verifyIndex <
      claimIndex
    );
  }
);
