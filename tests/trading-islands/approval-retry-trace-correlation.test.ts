import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function riskSource(
  file:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/risk/${file}`,
      import.meta.url
    ),
    "utf8"
  );
}

function activitySource(
  file:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/activity/${file}`,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "retry history carries a non-authoritative mutation correlation reference",
  () => {
    const content =
      riskSource(
        "approvalRemoteRetryHistory.ts"
      );

    assert.match(
      content,
      /readonly mutationRef:[\s\S]*?string \| null/
    );

    assert.match(
      content,
      /authoritative:[\s\S]*?false/
    );
  }
);


test(
  "retry recorder preserves legacy callers with nullable correlation",
  () => {
    const content =
      riskSource(
        "approvalRemoteRetryHistoryStore.ts"
      );

    assert.match(
      content,
      /mutationRef:[\s\S]*?string \| null[\s\S]*?=[\s\S]*?null/
    );

    assert.match(
      content,
      /mutationRef,/
    );
  }
);


test(
  "remote persistence correlates evidence with store-owned mutation identity",
  () => {
    const content =
      riskSource(
        "remoteApprovalPersistence.ts"
      );

    assert.match(
      content,
      /recordApprovalRemoteRetryAttempt\([\s\S]*?"write"[\s\S]*?mutation\?\.mutationId/
    );

    assert.match(
      content,
      /recordApprovalRemoteRetryAttempt\([\s\S]*?"clear"[\s\S]*?mutation\?\.mutationId/
    );
  }
);


test(
  "activity uses mutation correlation without granting authority",
  () => {
    const content =
      activitySource(
        "builders.ts"
      );

    assert.match(
      content,
      /entry\.mutationRef/
    );

    assert.match(
      content,
      /remote-mutation:/
    );

    const start =
      content.indexOf(
        "activityFromRemoteRetryHistoryEntry"
      );

    assert.notEqual(
      start,
      -1
    );

    const section =
      content.slice(
        start
      );

    assert.match(
      section,
      /authority:[\s\S]*?"none"/
    );
  }
);
