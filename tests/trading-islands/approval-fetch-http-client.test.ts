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
  "fetch adapter implements abstract ApprovalHttpClient",
  () => {
    const content =
      source(
        "risk/approvalFetchHttpClient.ts"
      );

    assert.match(
      content,
      /createApprovalFetchHttpClient/
    );

    assert.match(
      content,
      /ApprovalHttpClient/
    );

    assert.match(
      content,
      /ApprovalHttpRequest/
    );

    assert.match(
      content,
      /ApprovalHttpResponse/
    );
  }
);


test(
  "fetch adapter requires injected base URL",
  () => {
    const content =
      source(
        "risk/approvalFetchHttpClient.ts"
      );

    assert.match(
      content,
      /readonly baseUrl:/
    );

    assert.match(
      content,
      /normalizeBaseUrl/
    );

    assert.doesNotMatch(
      content,
      /localhost/
    );

    assert.doesNotMatch(
      content,
      /digitalboost\.(?:com|io|app)/
    );
  }
);


test(
  "fetch adapter supports HTTP and HTTPS only",
  () => {
    const content =
      source(
        "risk/approvalFetchHttpClient.ts"
      );

    assert.match(
      content,
      /"http:"/
    );

    assert.match(
      content,
      /"https:"/
    );
  }
);


test(
  "fetch is isolated to concrete adapter",
  () => {
    const content =
      source(
        "risk/approvalFetchHttpClient.ts"
      );

    assert.match(
      content,
      /fetchImpl/
    );

    assert.match(
      content,
      /await fetchImpl/
    );
  }
);


test(
  "fetch adapter maps timeout abort and network failures",
  () => {
    const content =
      source(
        "risk/approvalFetchHttpClient.ts"
      );

    assert.match(
      content,
      /"aborted"/
    );

    assert.match(
      content,
      /"timeout"/
    );

    assert.match(
      content,
      /"network"/
    );

    assert.match(
      content,
      /ApprovalHttpClientError/
    );
  }
);


test(
  "fetch adapter does not own approval authority",
  () => {
    const content =
      source(
        "risk/approvalFetchHttpClient.ts"
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
  "fetch adapter contains no credentials",
  () => {
    const content =
      source(
        "risk/approvalFetchHttpClient.ts"
      );

    assert.doesNotMatch(
      content,
      /bearer/i
    );

    assert.doesNotMatch(
      content,
      /authorization/i
    );

    assert.doesNotMatch(
      content,
      /api[_-]?key/i
    );

    assert.doesNotMatch(
      content,
      /secret/i
    );
  }
);


test(
  "fetch adapter cannot execute trading runtime",
  () => {
    const content =
      source(
        "risk/approvalFetchHttpClient.ts"
      );

    assert.doesNotMatch(
      content,
      /executePaperOrder/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeStep/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeSession/
    );
  }
);


test(
  "abstract HTTP port remains fetch free",
  () => {
    const content =
      source(
        "risk/approvalHttpClient.ts"
      );

    assert.doesNotMatch(
      content,
      /\bfetch\s*\(/
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
      /approval:\s*createApprovalFetchHttpClient/
    );
  }
);
