import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const appSource =
  fs.readFileSync(
    new URL(
      "../../src/App.tsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "App imports Trading Islands workspace exactly once",
  () => {
    const matches =
      appSource.match(
        /import TradingIslandsWorkspace from ['"]\.\/trading\/TradingIslandsWorkspace['"];/g
      ) || [];

    assert.equal(
      matches.length,
      1
    );
  }
);

test(
  "islands mode renders Trading Islands workspace exactly once",
  () => {
    const routes =
      appSource.match(
        /activeTab === ['"]islands['"]/g
      ) || [];

    const renders =
      appSource.match(
        /<TradingIslandsWorkspace/g
      ) || [];

    assert.equal(
      routes.length,
      1
    );

    assert.equal(
      renders.length,
      1
    );
  }
);

test(
  "islands route no longer renders Commerce marketplace legacy UI",
  () => {
    const routeStart =
      appSource.indexOf(
        "if (activeTab === 'islands')"
      );

    assert.notEqual(
      routeStart,
      -1
    );

    const nextReturn =
      appSource.indexOf(
        "\n\n  return (",
        routeStart
      );

    const routeBlock =
      appSource.slice(
        routeStart,
        nextReturn === -1
          ? undefined
          : nextReturn
      );

    assert.doesNotMatch(
      routeBlock,
      /CommerceStoreProvider/
    );

    assert.doesNotMatch(
      routeBlock,
      /DigitalBoostMarketplacePanel/
    );
  }
);

test(
  "existing primary workspaces remain routed",
  () => {
    for (const mode of [
      "forge",
      "store",
      "websites",
    ]) {
      assert.match(
        appSource,
        new RegExp(
          `activeTab === ['"]${mode}['"]`
        )
      );
    }
  }
);
