import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const provenanceWorkspace =
  fs.readFileSync(
    "src/trading/nft/provenance/NftProvenanceWorkspace.tsx",
    "utf8"
  );

const forgeWorkspace =
  fs.readFileSync(
    "src/trading/nft/NftForgeWorkspace.tsx",
    "utf8"
  );

test(
  "NFT Forge preserves Origin DNA and Provenance workspaces",
  () => {
    assert.match(
      forgeWorkspace,
      /<NftOriginWorkspace \/>/
    );

    assert.match(
      forgeWorkspace,
      /<NftDnaWorkspace \/>/
    );

    assert.match(
      forgeWorkspace,
      /<NftProvenanceWorkspace \/>/
    );
  }
);

test(
  "Provenance workspace exposes evidence graph",
  () => {
    assert.match(
      provenanceWorkspace,
      /Evidence Nodes/
    );

    assert.match(
      provenanceWorkspace,
      /Evidence Links/
    );

    assert.match(
      provenanceWorkspace,
      /Evidence Graph & Provenance Chain/
    );
  }
);

test(
  "Provenance workspace exposes history and closure",
  () => {
    assert.match(
      provenanceWorkspace,
      /Provenance History/
    );

    assert.match(
      provenanceWorkspace,
      /Cross-domain closure/
    );

    assert.match(
      provenanceWorkspace,
      /validateNftProvenanceClosure/
    );

    assert.match(
      provenanceWorkspace,
      /validateProvenanceConsistency/
    );
  }
);

test(
  "Provenance workspace preserves authority boundaries",
  () => {
    assert.match(
      provenanceWorkspace,
      /provenance ≠ ownership/
    );

    assert.match(
      provenanceWorkspace,
      /evidence ≠ absolute truth/
    );

    assert.match(
      provenanceWorkspace,
      /blockchain proof ≠ legal title/
    );

    assert.match(
      provenanceWorkspace,
      /data-authority="none"/
    );
  }
);

test(
  "Provenance workspace performs no external execution",
  () => {
    assert.doesNotMatch(
      provenanceWorkspace,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      provenanceWorkspace,
      /WebSocket/
    );

    assert.doesNotMatch(
      provenanceWorkspace,
      /ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      provenanceWorkspace,
      /eth_sendTransaction/
    );

    assert.doesNotMatch(
      provenanceWorkspace,
      /eth_sendRawTransaction/
    );
  }
);
