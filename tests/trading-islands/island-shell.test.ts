import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const tradingRoot =
  new URL(
    "../../src/trading/",
    import.meta.url
  );

function source(
  path: string
): string {
  return fs.readFileSync(
    new URL(
      path,
      tradingRoot
    ),
    "utf8"
  );
}

test(
  "Trading Islands workspace and shell exist",
  () => {
    for (const path of [
      "TradingIslandsWorkspace.tsx",
      "shell/IslandShell.tsx",
      "shell/IslandSidebar.tsx",
      "shell/IslandTopbar.tsx",
    ]) {
      assert.equal(
        fs.existsSync(
          new URL(
            path,
            tradingRoot
          )
        ),
        true,
        `missing ${path}`
      );
    }
  }
);

test(
  "workspace exposes the primary product sections",
  () => {
    const content =
      source(
        "shell/IslandSidebar.tsx"
      );

    for (const section of [
      "overview",
      "terminal",
      "markets",
      "strategies",
      "bot-forge",
      "backtests",
      "paper",
      "risk",
      "nft-forge",
      "marketplace",
      "dbx",
      "activity",
    ]) {
      assert.match(
        content,
        new RegExp(
          `["']${section}["']`
        )
      );
    }
  }
);

test(
  "workspace is rooted in the Trading Islands namespace",
  () => {
    assert.match(
      source(
        "shell/IslandShell.tsx"
      ),
      /data-trading-islands="true"/
    );
  }
);

test(
  "Trading Islands source remains isolated from external orchestration",
  () => {
    const files = [
      "TradingIslandsWorkspace.tsx",
      "shell/IslandShell.tsx",
      "shell/IslandSidebar.tsx",
      "shell/IslandTopbar.tsx",
    ];

    for (const file of files) {
      assert.doesNotMatch(
        source(file),
        /DigitalBoostPulse|from\s+["'][^"']*Pulse/i
      );
    }
  }
);

test(
  "workspace declares mock and paper boundaries",
  () => {
    const topbar =
      source(
        "shell/IslandTopbar.tsx"
      );

    assert.match(
      topbar,
      /Mock market/
    );

    assert.match(
      topbar,
      /Paper only/
    );
  }
);
