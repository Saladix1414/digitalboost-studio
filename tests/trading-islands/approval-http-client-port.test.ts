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
  "HTTP port defines explicit request and response contracts",
  () => {
    const content =
      source(
        "risk/approvalHttpClient.ts"
      );

    for (
      const token of [
        "ApprovalHttpRequest",
        "ApprovalHttpResponse",
        "ApprovalHttpClient",
        "ApprovalHttpHeaders",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          token
        )
      );
    }
  }
);


test(
  "HTTP request contract includes timeout and cancellation",
  () => {
    const content =
      source(
        "risk/approvalHttpClient.ts"
      );

    assert.match(
      content,
      /timeoutMs/
    );

    assert.match(
      content,
      /AbortSignal/
    );

    assert.match(
      content,
      /signal/
    );
  }
);


test(
  "HTTP port supports only approval transport methods",
  () => {
    const content =
      source(
        "risk/approvalHttpClient.ts"
      );

    assert.match(
      content,
      /"GET"/
    );

    assert.match(
      content,
      /"PUT"/
    );

    assert.match(
      content,
      /"DELETE"/
    );

    assert.doesNotMatch(
      content,
      /"PATCH"/
    );

    assert.doesNotMatch(
      content,
      /"POST"/
    );
  }
);


test(
  "HTTP paths remain relative and endpoint neutral",
  () => {
    const content =
      source(
        "risk/approvalHttpClient.ts"
      );

    assert.match(
      content,
      /path\.startsWith/
    );

    assert.match(
      content,
      /must be relative/
    );

    assert.doesNotMatch(
      content,
      /https?:\/\//
    );
  }
);


test(
  "HTTP client failures remain explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/approvalHttpClient.ts"
      );

    assert.match(
      content,
      /authoritative[\s\S]*?false/
    );

    assert.doesNotMatch(
      content,
      /authoritative[\s\S]*?true/
    );
  }
);


test(
  "HTTP port models retryable status without retry implementation",
  () => {
    const content =
      source(
        "risk/approvalHttpClient.ts"
      );

    assert.match(
      content,
      /isApprovalHttpRetryableStatus/
    );

    assert.match(
      content,
      /429/
    );

    assert.match(
      content,
      /status >=[\s\S]*?500/
    );

    assert.doesNotMatch(
      content,
      /setTimeout\s*\(/
    );
  }
);


test(
  "HTTP port has no concrete client implementation",
  () => {
    const content =
      source(
        "risk/approvalHttpClient.ts"
      );

    for (
      const pattern of [
        /\bfetch\s*\(/,
        /XMLHttpRequest/,
        /WebSocket/,
        /axios/i,
        /node:http/,
        /node:https/,
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
  "HTTP port contains no credentials",
  () => {
    const content =
      source(
        "risk/approvalHttpClient.ts"
      );

    for (
      const pattern of [
        /bearer/i,
        /authorization/i,
        /api[_-]?key/i,
        /secret/i,
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
  "HTTP port cannot execute trading runtime",
  () => {
    const content =
      source(
        "risk/approvalHttpClient.ts"
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
  "Bot Forge authority remains active review",
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
      /approval:\s*ApprovalHttp/
    );
  }
);
