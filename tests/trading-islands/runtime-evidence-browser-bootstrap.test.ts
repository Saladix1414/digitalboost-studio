import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";


function source(
  path:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/${path}`,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "runtime evidence browser bootstrap owns configure then hydrate",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceBrowserBootstrap.ts"
      );

    assert.match(
      content,
      /createBrowserRuntimeEvidencePersistence/
    );

    assert.match(
      content,
      /configureRuntimeEvidencePersistence/
    );

    assert.match(
      content,
      /hydrateRuntimeEvidence/
    );

    const configureIndex =
      content.indexOf(
        "configureRuntimeEvidencePersistence("
      );

    const hydrateIndex =
      content.indexOf(
        "await hydrateRuntimeEvidence();"
      );

    assert.ok(
      configureIndex >= 0
    );

    assert.ok(
      hydrateIndex >
        configureIndex
    );
  }
);


test(
  "browser bootstrap is idempotent within one runtime context",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceBrowserBootstrap.ts"
      );

    assert.match(
      content,
      /runtimeEvidenceBrowserBootstrap/
    );

    assert.match(
      content,
      /Promise<void> \| null/
    );

    assert.match(
      content,
      /return runtimeEvidenceBrowserBootstrap/
    );
  }
);


test(
  "Trading Islands composition root owns bootstrap",
  () => {
    const workspace =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    const activity =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      workspace,
      /useRuntimeEvidenceBrowserBootstrap/
    );

    assert.doesNotMatch(
      activity,
      /useRuntimeEvidenceBrowserBootstrap|bootstrapRuntimeEvidenceBrowserPersistence/
    );

    assert.doesNotMatch(
      bot,
      /useRuntimeEvidenceBrowserBootstrap|bootstrapRuntimeEvidenceBrowserPersistence/
    );
  }
);


test(
  "browser bootstrap contains no direct storage implementation",
  () => {
    const bootstrap =
      source(
        "runtime/runtimeEvidenceBrowserBootstrap.ts"
      );

    const hook =
      source(
        "runtime/useRuntimeEvidenceBrowserBootstrap.ts"
      );

    const workspace =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    const combined = [
      bootstrap,
      hook,
      workspace,
    ].join(
      "\n"
    );

    assert.doesNotMatch(
      combined,
      /localStorage|sessionStorage|indexedDB/
    );

    assert.doesNotMatch(
      combined,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      combined,
      /runBotRuntimeSession|runBotRuntimeStep|executePaperOrder|fillPaperMarketOrder/
    );
  }
);


test(
  "Bot Forge remains independent from evidence bootstrap and lifecycle",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /approval:\s*[\r\n\t ]*activeReview/
    );

    assert.doesNotMatch(
      content,
      /runtimeEvidenceLifecycle|getRuntimeEvidenceLifecycle|hydrateRuntimeEvidence/
    );

    assert.doesNotMatch(
      content,
      /bootstrapRuntimeEvidenceBrowserPersistence/
    );
  }
);
