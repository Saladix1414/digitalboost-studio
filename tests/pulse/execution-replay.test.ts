import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";

import {
  evaluatePulsePolicy,
  createPulseApproval,
  approvePulseAction,
} from "../../src/DigitalBoostPulseGovernance";

import {
  executePulseAction,
} from "../../src/DigitalBoostPulseExecutor";

import {
  currentContextVersion,
} from "../../src/DigitalBoostPulseContext";

const storage = new Map<string, string>();

function browser() {
  storage.clear();

  (globalThis as any).localStorage = {
    getItem(key: string) {
      return storage.has(key)
        ? storage.get(key)!
        : null;
    },

    setItem(key: string, value: string) {
      storage.set(key, String(value));
    },

    removeItem(key: string) {
      storage.delete(key);
    },
  };

  (globalThis as any).window = {
    __dbSetBlocks() {},

    dispatchEvent() {
      return true;
    },
  };
}

function setCanvas() {
  const blocks = [{
    id: "hero",
    type: "hero",
    title: "Original",
    body: "Original body",
    cta: "Original CTA",
  }];

  localStorage.setItem(
    "db-store-page-v1",
    "Inicio",
  );

  localStorage.setItem(
    "db-store-canvas-v1:Inicio",
    JSON.stringify(blocks),
  );

  localStorage.setItem(
    "db-store-canvas-v1",
    JSON.stringify(blocks),
  );
}

function createHeroApproval(
  requestId: string,
  draft: {
    kind: "hero";
    title: string;
    body: string;
    cta: string;
  },
) {
  const envelope = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    requestId,
    {
      action: "hero",
      target: "Nimbus:website-builder:hero",
      actor: "merchant",
      tenant: "Nimbus",
      context_version:
        currentContextVersion({
          store: "Nimbus",
          section: "website-builder",
        }),
      proposal: draft,
    },
  );

  const created = createPulseApproval(
    envelope,
  );

  assert.ok(created);

  return {
    envelope,
    approval: approvePulseAction(
      created,
    ),
  };
}

beforeEach(browser);

test(
  "P0.4.14 mismo approval no puede ejecutar dos veces",
  () => {
    setCanvas();

    const draft = {
      kind: "hero" as const,
      title: "Replay Safe",
      body: "Body Safe",
      cta: "Entrar",
    };

    const prepared = createHeroApproval(
      "req_p0414_replay",
      draft,
    );

    const first = executePulseAction({
      envelope: prepared.envelope,
      approval: prepared.approval,
      draft,
    });

    assert.equal(
      first.state,
      "COMPLETED",
    );

    const afterFirst = JSON.stringify(
      JSON.parse(
        localStorage.getItem(
          "db-store-canvas-v1",
        ) || "[]",
      ),
    );

    const second = executePulseAction({
      envelope: prepared.envelope,
      approval: {
        ...prepared.approval,
      },
      draft,
    });

    assert.equal(
      second.state,
      "REJECTED",
    );

    assert.equal(
      second.error,
      "EXECUTION_REPLAY",
    );

    const afterSecond = JSON.stringify(
      JSON.parse(
        localStorage.getItem(
          "db-store-canvas-v1",
        ) || "[]",
      ),
    );

    assert.equal(
      afterSecond,
      afterFirst,
    );

    const claims = JSON.parse(
      localStorage.getItem(
        "db-pulse-execution-claims-v1",
      ) || "[]",
    );

    assert.equal(
      claims.length,
      1,
    );

    assert.equal(
      claims[0].approval_id,
      prepared.approval.approval_id,
    );
  },
);

test(
  "P0.4.14 precheck fallido no consume approval",
  () => {
    setCanvas();

    const draft = {
      kind: "hero" as const,
      title: "Precheck Safe",
      body: "Body Safe",
      cta: "Entrar",
    };

    const prepared = createHeroApproval(
      "req_p0414_precheck",
      draft,
    );

    const failed = executePulseAction({
      envelope: prepared.envelope,
      approval: prepared.approval,
    });

    assert.equal(
      failed.state,
      "FAILED",
    );

    const claimsAfterFailure = JSON.parse(
      localStorage.getItem(
        "db-pulse-execution-claims-v1",
      ) || "[]",
    );

    assert.equal(
      claimsAfterFailure.length,
      0,
    );

    const recovered = executePulseAction({
      envelope: prepared.envelope,
      approval: {
        ...prepared.approval,
      },
      draft,
    });

    assert.equal(
      recovered.state,
      "COMPLETED",
    );

    const claimsAfterSuccess = JSON.parse(
      localStorage.getItem(
        "db-pulse-execution-claims-v1",
      ) || "[]",
    );

    assert.equal(
      claimsAfterSuccess.length,
      1,
    );
  },
);
