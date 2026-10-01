import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/trading/",
    import.meta.url
  );

function source(
  path:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      path,
      root
    ),
    "utf8"
  );
}


test(
  "environment boundary owns approval Vite keys",
  () => {
    const content =
      source(
        "risk/approvalEnvironmentConfig.ts"
      );

    for (
      const key of [
        "VITE_TRADING_APPROVAL_PERSISTENCE_MODE",
        "VITE_TRADING_APPROVAL_BASE_URL",
        "VITE_TRADING_APPROVAL_PATH",
        "VITE_TRADING_APPROVAL_TIMEOUT_MS",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          key
        )
      );
    }
  }
);


test(
  "environment parser defaults to local mode",
  () => {
    const content =
      source(
        "risk/approvalEnvironmentConfig.ts"
      );

    assert.match(
      content,
      /raw ===[\s\S]*?null/
    );

    assert.match(
      content,
      /return "local"/
    );
  }
);


test(
  "remote environment requires explicit base URL",
  () => {
    const content =
      source(
        "risk/approvalEnvironmentConfig.ts"
      );

    assert.match(
      content,
      /validateRemoteBaseUrl/
    );

    assert.match(
      content,
      /requires VITE_TRADING_APPROVAL_BASE_URL/
    );
  }
);


test(
  "environment boundary validates relative path and timeout",
  () => {
    const content =
      source(
        "risk/approvalEnvironmentConfig.ts"
      );

    assert.match(
      content,
      /validateRelativePath/
    );

    assert.match(
      content,
      /parseTimeout/
    );

    assert.match(
      content,
      /positive integer/
    );
  }
);


test(
  "import.meta environment access is isolated to concrete configuration file",
  () => {
    const riskRoot =
      new URL(
        "risk/",
        root
      );

    const directory =
      fs.readdirSync(
        riskRoot,
        {
          withFileTypes:
            true,
        }
      );

    const offenders:
      string[] = [];

    for (
      const entry of directory
    ) {
      if (
        !entry.isFile() ||
        !entry.name.endsWith(
          ".ts"
        ) ||
        entry.name ===
          "approvalEnvironmentConfig.ts"
      ) {
        continue;
      }

      const content =
        fs.readFileSync(
          new URL(
            entry.name,
            riskRoot
          ),
          "utf8"
        );

      if (
        content.includes(
          "import.meta.env"
        )
      ) {
        offenders.push(
          entry.name
        );
      }
    }

    assert.deepEqual(
      offenders,
      []
    );
  }
);


test(
  "React bootstrap consumes environment boundary rather than import.meta directly",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /readApprovalEnvironmentConfig/
    );

    assert.match(
      content,
      /selectApprovalPersistence/
    );

    assert.doesNotMatch(
      content,
      /import\.meta\.env/
    );
  }
);


test(
  "environment configuration contains no credentials",
  () => {
    const content =
      source(
        "risk/approvalEnvironmentConfig.ts"
      );

    for (
      const pattern of [
        /authorization/i,
        /bearer/i,
        /api[_-]?key/i,
        /secret/i,
        /password/i,
      ]
    ) {
      assert.doesNotMatch(
        content,
        pattern
      );
    }
  }
);


test(
  "environment configuration cannot execute trading",
  () => {
    const content =
      source(
        "risk/approvalEnvironmentConfig.ts"
      );

    for (
      const pattern of [
        /executePaperOrder/,
        /fillPaperMarketOrder/,
        /runBotRuntimeStep/,
        /runBotRuntimeSession/,
      ]
    ) {
      assert.doesNotMatch(
        content,
        pattern
      );
    }
  }
);


test(
  "environment configuration remains non-authoritative infrastructure",
  () => {
    const content =
      source(
        "risk/approvalEnvironmentConfig.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /RiskReview/
    );

    assert.doesNotMatch(
      content,
      /bindingFingerprint/
    );
  }
);


test(
  "Bot Forge runtime authority remains active review",
  () => {
    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      bot,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*readApprovalEnvironmentConfig/
    );
  }
);
