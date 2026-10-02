import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    "src/trading/nft/dna/NftDnaWorkspace.tsx",
    "utf8"
  );

const forge =
  fs.readFileSync(
    "src/trading/nft/NftForgeWorkspace.tsx",
    "utf8"
  );

test(
  "NFT Forge mounts DNA workspace",
  () => {
    assert.match(
      forge,
      /NftDnaWorkspace/
    );

    assert.match(
      forge,
      /<NftDnaWorkspace \/>/
    );
  }
);

test(
  "DNA workspace exposes identity integrity and blockchain proof separately",
  () => {
    assert.match(
      workspace,
      /Identity/
    );

    assert.match(
      workspace,
      /Integrity/
    );

    assert.match(
      workspace,
      /Blockchain Proof/
    );
  }
);

test(
  "DNA workspace surfaces explicit authority boundaries",
  () => {
    assert.match(
      workspace,
      /identity ≠ proof/
    );

    assert.match(
      workspace,
      /hash ≠ ownership/
    );

    assert.match(
      workspace,
      /DNA ≠ provenance authority/
    );

    assert.match(
      workspace,
      /data-dna-authority="none"/
    );
  }
);

test(
  "DNA workspace exposes change detection",
  () => {
    assert.match(
      workspace,
      /compareNftDna/
    );

    assert.match(
      workspace,
      /Change detection/
    );
  }
);

test(
  "DNA workspace performs no blockchain execution",
  () => {
    assert.doesNotMatch(
      workspace,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      workspace,
      /WebSocket/
    );

    assert.doesNotMatch(
      workspace,
      /ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      workspace,
      /eth_sendTransaction/
    );
  }
);
