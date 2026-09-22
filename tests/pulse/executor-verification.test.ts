import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";

import {
  evaluatePulsePolicy,
  createPulseApproval,
  approvePulseAction,
} from "../../src/DigitalBoostPulseGovernance";

import { postcheckPulseExecution } from "../../src/DigitalBoostPulseVerify";
import { executePulseAction } from "../../src/DigitalBoostPulseExecutor";

const store = new Map<string, string>();

function browser() {
  store.clear();

  (globalThis as any).localStorage = {
    getItem: (key: string) =>
      store.has(key) ? store.get(key)! : null,
    setItem: (key: string, value: string) =>
      store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
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

  localStorage.setItem("db-store-page-v1", "Inicio");
  localStorage.setItem(
    "db-store-canvas-v1:Inicio",
    JSON.stringify(blocks),
  );
  localStorage.setItem(
    "db-store-canvas-v1",
    JSON.stringify(blocks),
  );
}

function approval(
  action: string,
  requestId: string,
  proposal: unknown,
  target: string,
) {
  const envelope = evaluatePulsePolicy(
    action,
    "L1",
    true,
    requestId,
    { action, target, proposal },
  );

  const created = createPulseApproval(envelope);
  assert.ok(created);

  return {
    envelope,
    approval: approvePulseAction(created),
  };
}

beforeEach(browser);

test("P0.3 postcheck rechaza mutación sin estado persistido", () => {
  const result = postcheckPulseExecution({
    action: "hero",
  });

  assert.equal(result.status, "FAIL");
  assert.equal(result.verified, false);
});

test("P0.3 hero verifica Canvas persistido", () => {
  setCanvas();

  const draft = {
    kind: "hero",
    title: "Nuevo titulo",
    body: "Nuevo body",
    cta: "Nueva CTA",
  };

  const a = approval(
    "hero",
    "req_p03_hero",
    draft,
    "Nimbus:builder:hero",
  );

  const result = executePulseAction({
    envelope: a.envelope,
    approval: a.approval,
    draft,
  });

  assert.equal(result.state, "COMPLETED");
  assert.equal(result.verified, true);

  const saved = JSON.parse(
    localStorage.getItem(
      "db-store-canvas-v1:Inicio",
    ) || "[]",
  );

  assert.equal(saved[0].title, "Nuevo titulo");
  assert.equal(saved[0].body, "Nuevo body");
  assert.equal(saved[0].cta, "Nueva CTA");
  assert.equal(
    result.audit.metadata?.verification_status,
    "PASS",
  );
});

test("P0.3 theme verifica db-os-theme-v1", () => {
  setCanvas();
  localStorage.setItem("db-os-theme-v1", "nimbus");

  const draft = {
    kind: "theme",
    title: "Noir",
    body: "Tema Noir",
    cta: "Aplicar",
  };

  const a = approval(
    "website-builder",
    "req_p03_theme",
    draft,
    "Nimbus:builder:theme",
  );

  const result = executePulseAction({
    envelope: a.envelope,
    approval: a.approval,
    draft,
  });

  assert.equal(result.state, "COMPLETED");
  assert.equal(result.verified, true);
  assert.equal(
    localStorage.getItem("db-os-theme-v1"),
    "noir",
  );
});

test("P0.3 postcheck fallido hace rollback Canvas verificable", () => {
  setCanvas();

  const before =
    localStorage.getItem(
      "db-store-canvas-v1:Inicio",
    );

  const draft = {
    kind: "hero",
    title: "Temporal",
    body: "Temporal body",
    cta: "Temporal CTA",
  };

  const a = approval(
    "hero",
    "req_p03_rollback",
    draft,
    "Nimbus:builder:hero",
  );

  const result = executePulseAction({
    envelope: a.envelope,
    approval: a.approval,
    draft,
    onNavigate() {
      const corrupted = [{
        id: "hero",
        type: "hero",
        title: "CORRUPTO",
        body: "CORRUPTO",
        cta: "CORRUPTO",
      }];

      localStorage.setItem(
        "db-store-canvas-v1:Inicio",
        JSON.stringify(corrupted),
      );
      localStorage.setItem(
        "db-store-canvas-v1",
        JSON.stringify(corrupted),
      );
    },
  });

  assert.equal(result.state, "FAILED");
  assert.equal(result.verified, false);
  assert.equal(result.rolledBack, true);

  assert.equal(
    localStorage.getItem(
      "db-store-canvas-v1:Inicio",
    ),
    before,
  );

  assert.equal(
    result.audit.metadata?.verification_status,
    "FAIL",
  );

  assert.equal(
    result.audit.metadata?.rollback_verified,
    true,
  );
});
