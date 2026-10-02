import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    "src/trading/nft/origin/NftOriginModesWorkspace.tsx",
    "utf8"
  );

const originWorkspace =
  fs.readFileSync(
    "src/trading/nft/origin/NftOriginWorkspace.tsx",
    "utf8"
  );

test(
  "Origin workspace mounts Origin Modes workspace",
  () => {
    assert.match(
      originWorkspace,
      /NftOriginModesWorkspace/
    );

    assert.match(
      originWorkspace,
      /<NftOriginModesWorkspace \/>/
    );
  }
);

test(
  "Origin Modes workspace exposes all four modes",
  () => {
    assert.match(
      workspace,
      /CLASSIC/
    );

    assert.match(
      workspace,
      /GENERATIVE/
    );

    assert.match(
      workspace,
      /LIVING/
    );

    assert.match(
      workspace,
      /IMPORTED/
    );
  }
);

test(
  "Origin Modes workspace performs deterministic capture",
  () => {
    assert.match(
      workspace,
      /captureNftOrigin/
    );

    assert.match(
      workspace,
      /Capture result/
    );

    assert.match(
      workspace,
      /ACCEPTED/
    );
  }
);

test(
  "Origin Modes workspace preserves authority boundaries",
  () => {
    assert.match(
      workspace,
      /mode ≠ provenance/
    );

    assert.match(
      workspace,
      /mode ≠ ownership/
    );

    assert.match(
      workspace,
      /capture ≠ authenticity/
    );

    assert.match(
      workspace,
      /data-authority="none"/
    );
  }
);

test(
  "Origin Modes workspace performs no external execution",
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

    assert.doesNotMatch(
      workspace,
      /eth_sendRawTransaction/
    );
  }
);
