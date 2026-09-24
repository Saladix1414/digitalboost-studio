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

import {
  claimPulseExecution,
  PULSE_EXECUTION_CLAIM_KEY_PREFIX,
} from "../../src/DigitalBoostPulseExecutionLedger";

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

    const claimKey =
      PULSE_EXECUTION_CLAIM_KEY_PREFIX +
      encodeURIComponent(
        prepared.approval.approval_id,
      );

    const claimRaw =
      localStorage.getItem(claimKey);

    assert.ok(claimRaw);

    const claim = JSON.parse(
      claimRaw!,
    );

    assert.equal(
      claim.approval_id,
      prepared.approval.approval_id,
    );
  },
);

test(
  "P0.4.15 una approval consumida no desaparece tras superar 400 claims",
  async () => {
    const { claimPulseExecution } =
      await import("../../src/DigitalBoostPulseExecutionLedger");

    const first = claimPulseExecution({
      approvalId: "approval_p0415_first",
      requestId: "request_p0415_first",
      action: "hero",
    });

    assert.equal(first.claimed, true);

    for (let i = 0; i < 400; i += 1) {
      const result = claimPulseExecution({
        approvalId: `approval_p0415_fill_${i}`,
        requestId: `request_p0415_fill_${i}`,
        action: "hero",
      });

      assert.equal(result.claimed, true);
    }

    const replay = claimPulseExecution({
      approvalId: "approval_p0415_first",
      requestId: "request_p0415_first",
      action: "hero",
    });

    assert.equal(replay.claimed, false);

    if (!replay.claimed) {
      assert.equal(
        replay.reason,
        "ALREADY_CLAIMED",
      );
    }
  },
);

test(
  "P0.4.16 ledger v2 separa las claims por approval_id",
  () => {
    const first = claimPulseExecution({
      approvalId: "approval_p0416_first",
      requestId: "request_p0416_first",
      action: "hero",
    });

    assert.equal(first.claimed, true);

    for (let i = 0; i < 1000; i += 1) {
      const result = claimPulseExecution({
        approvalId: `approval_p0416_${i}`,
        requestId: `request_p0416_${i}`,
        action: "hero",
      });

      assert.equal(result.claimed, true);
    }

    assert.equal(
      storage.has("db-pulse-execution-claims-v1"),
      false,
    );

    const v2Keys = Array.from(
      storage.keys(),
    ).filter((key) =>
      key.startsWith(
        PULSE_EXECUTION_CLAIM_KEY_PREFIX,
      ),
    );

    assert.equal(
      v2Keys.length,
      1001,
    );

    const replay = claimPulseExecution({
      approvalId: "approval_p0416_first",
      requestId: "request_p0416_first",
      action: "hero",
    });

    assert.equal(
      replay.claimed,
      false,
    );

    if (!replay.claimed) {
      assert.equal(
        replay.reason,
        "ALREADY_CLAIMED",
      );
    }
  },
);

test(
  "P0.4.16 legacy v1 sigue bloqueando replay",
  () => {
    const legacyClaim = {
      approval_id: "approval_p0416_legacy",
      request_id: "request_p0416_legacy",
      action: "hero",
      claimed_at: "2026-09-24T00:00:00.000Z",
    };

    localStorage.setItem(
      "db-pulse-execution-claims-v1",
      JSON.stringify([legacyClaim]),
    );

    const result = claimPulseExecution({
      approvalId: "approval_p0416_legacy",
      requestId: "request_p0416_legacy",
      action: "hero",
    });

    assert.equal(
      result.claimed,
      false,
    );

    if (!result.claimed) {
      assert.equal(
        result.reason,
        "ALREADY_CLAIMED",
      );
    }

    const expectedV2Key =
      PULSE_EXECUTION_CLAIM_KEY_PREFIX +
      encodeURIComponent(
        "approval_p0416_legacy",
      );

    assert.equal(
      storage.has(expectedV2Key),
      false,
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

    const claimKey =
      PULSE_EXECUTION_CLAIM_KEY_PREFIX +
      encodeURIComponent(
        prepared.approval.approval_id,
      );

    assert.equal(
      localStorage.getItem(claimKey),
      null,
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

    const successClaimKey =
      PULSE_EXECUTION_CLAIM_KEY_PREFIX +
      encodeURIComponent(
        prepared.approval.approval_id,
      );

    assert.ok(
      localStorage.getItem(successClaimKey),
    );
  },
);
