import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    "src/trading/nft/origin/NftOriginWorkspace.tsx",
    "utf8"
  );

const forge =
  fs.readFileSync(
    "src/trading/nft/NftForgeWorkspace.tsx",
    "utf8"
  );

test(
  "NFT Forge mounts Origin workspace",
  () => {
    assert.match(
      forge,
      /NftOriginWorkspace/
    );

    assert.match(
      forge,
      /<NftOriginWorkspace \/>/
    );
  }
);

test(
  "Origin workspace exposes creation context and history",
  () => {
    assert.match(
      workspace,
      /Creation Context/
    );

    assert.match(
      workspace,
      /Capture History/
    );

    assert.match(
      workspace,
      /Origin Identity/
    );
  }
);

test(
  "Origin workspace surfaces DNA bridge status",
  () => {
    assert.match(
      workspace,
      /Origin ↔ DNA consistency/
    );

    assert.match(
      workspace,
      /validateOriginAgainstDna/
    );

    assert.match(
      workspace,
      /validateOriginDnaClosure/
    );
  }
);

test(
  "Origin workspace preserves authority boundaries",
  () => {
    assert.match(
      workspace,
      /origin ≠ provenance/
    );

    assert.match(
      workspace,
      /origin ≠ ownership/
    );

    assert.match(
      workspace,
      /consistency ≠ authority/
    );

    assert.match(
      workspace,
      /data-origin-authority="none"/
    );
  }
);

test(
  "Origin workspace performs no external blockchain execution",
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
