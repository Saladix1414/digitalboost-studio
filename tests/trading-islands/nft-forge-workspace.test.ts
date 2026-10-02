import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/trading/",
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
  "NFT Forge workspace is wired into Trading Islands",
  () => {
    const workspace =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    assert.match(
      workspace,
      /NftForgeWorkspace/
    );

    assert.match(
      workspace,
      /activeSection === "nft-forge"/
    );
  }
);

test(
  "NFT Forge exposes canonical foundation sections",
  () => {
    const content =
      source(
        "nft/NftForgeWorkspace.tsx"
      );

    for (
      const section of [
        "create",
        "collections",
        "drafts",
        "assets",
        "generative",
        "living",
        "origin",
        "certificates",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          `id: "${section}"`
        )
      );
    }
  }
);

test(
  "NFT Forge uses deterministic fixtures",
  () => {
    const content =
      source(
        "nft/fixtures.ts"
      );

    assert.match(
      content,
      /nftCollectionsFixture/
    );

    assert.match(
      content,
      /nftAssetsFixture/
    );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);

test(
  "NFT Forge foundation has no blockchain execution",
  () => {
    const files = [
      source(
        "nft/NftForgeWorkspace.tsx"
      ),
      source(
        "nft/fixtures.ts"
      ),
      source(
        "nft/types.ts"
      ),
    ].join("\n");

    assert.doesNotMatch(
      files,
      /ethers/i
    );

    assert.doesNotMatch(
      files,
      /viem/i
    );

    assert.doesNotMatch(
      files,
      /wagmi/i
    );

    assert.doesNotMatch(
      files,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      files,
      /WebSocket/
    );

    assert.doesNotMatch(
      files,
      /eth_sendTransaction/
    );

    assert.doesNotMatch(
      files,
      /eth_sendRawTransaction/
    );
  }
);

test(
  "NFT Forge does not claim mint authority",
  () => {
    const content =
      source(
        "nft/NftForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /data-authority="none"/
    );

    assert.match(
      content,
      /blockchain:none/
    );

    assert.doesNotMatch(
      content,
      /mint(ed)? successfully/i
    );
  }
);
