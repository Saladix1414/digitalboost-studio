import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/trading/nft/",
    import.meta.url
  );

function source(
  path: string
): string {
  return fs.readFileSync(
    new URL(path, root),
    "utf8"
  );
}

test(
  "NFT Forge mounts deterministic mint workspace",
  () => {
    const forge =
      source(
        "NftForgeWorkspace.tsx"
      );

    assert.match(
      forge,
      /NftMintWorkspace/
    );

    assert.match(
      forge,
      /<NftMintWorkspace \/>/
    );
  }
);

test(
  "mint workspace exposes basic and mint-on-sale modes",
  () => {
    const content =
      source(
        "mint/NftMintWorkspace.tsx"
      );

    assert.match(
      content,
      /BASIC/
    );

    assert.match(
      content,
      /MINT_ON_SALE/
    );

    assert.match(
      content,
      /150 DBX/
    );

    assert.match(
      content,
      /0 DBX upfront/
    );
  }
);

test(
  "mint workspace exposes explicit verification boundary",
  () => {
    const content =
      source(
        "mint/NftMintWorkspace.tsx"
      );

    assert.match(
      content,
      /submitted ≠ verified/
    );

    assert.match(
      content,
      /txHash ≠ authority/
    );

    assert.match(
      content,
      /Verify mint evidence/
    );

    assert.match(
      content,
      /data-mint-authority="verification-required"/
    );
  }
);

test(
  "mint UI does not execute external blockchain systems",
  () => {
    const content =
      source(
        "mint/NftMintWorkspace.tsx"
      );

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
  "mint UI does not claim success before verified state",
  () => {
    const content =
      source(
        "mint/NftMintWorkspace.tsx"
      );

    assert.doesNotMatch(
      content,
      /mint successful/i
    );

    assert.match(
      content,
      /Mint verified from complete/
    );
  }
);
