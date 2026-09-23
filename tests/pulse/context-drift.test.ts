import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";

import {
  evaluatePulsePolicy,
  createPulseApproval,
  approvePulseAction,
} from "../../src/DigitalBoostPulseGovernance";

import { executePulseAction } from "../../src/DigitalBoostPulseExecutor";
import {
  currentContextVersion,
} from "../../src/DigitalBoostPulseContext";
import {
  checkPulseContextDrift,
} from "../../src/DigitalBoostPulseContextDrift";

const storage = new Map<string, string>();

function browser() {
  storage.clear();

  const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) =>
      storage.set(key, String(value)),
    removeItem: (key: string) => storage.delete(key),
  };

  (globalThis as any).localStorage = localStorageMock;

  (globalThis as any).window = {
    localStorage: localStorageMock,
    __dbSetBlocks() {},
    dispatchEvent() {
      return true;
    },
  };
}

function seedCanvas() {
  const blocks = [
    {
      id: "hero",
      type: "hero",
      title: "Original",
      body: "Original body",
      cta: "Original CTA",
    },
  ];

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

beforeEach(browser);

test("P0.4.7 binding coincide con contexto actual", () => {
  seedCanvas();

  const contextVersion = currentContextVersion({
    store: "DriftMatch",
    section: "website-builder",
  });

  const envelope = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_p047_match",
    {
      action: "hero",
      target: "DriftMatch:website-builder:hero",
      actor: "merchant",
      tenant: "DriftMatch",
      context_version: contextVersion,
      proposal: {
        kind: "hero",
        title: "Hero",
        body: "Body",
        cta: "Entrar",
      },
    },
  );

  const result = checkPulseContextDrift(
    envelope.binding,
    "hero",
  );

  assert.equal(result.relevant, true);
  assert.equal(result.status, "MATCH");
});

test("P0.4.7 Context Drift bloquea hero aprobado antes de mutar", () => {
  seedCanvas();

  const draft = {
    kind: "hero",
    title: "Nuevo Hero",
    body: "Nuevo body",
    cta: "Entrar",
  };

  const contextVersion = currentContextVersion({
    store: "DriftBlock",
    section: "website-builder",
  });

  const envelope = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_p047_drift",
    {
      action: "hero",
      target: "DriftBlock:website-builder:hero",
      actor: "merchant",
      tenant: "DriftBlock",
      context_version: contextVersion,
      proposal: draft,
    },
  );

  const approval = approvePulseAction(
    createPulseApproval(envelope)!,
  );

  const before = localStorage.getItem(
    "db-store-canvas-v1:Inicio",
  );

  const changed = [
    ...JSON.parse(before || "[]"),
    {
      id: "drift",
      type: "text",
      body: "Context changed",
    },
  ];

  localStorage.setItem(
    "db-store-canvas-v1:Inicio",
    JSON.stringify(changed),
  );
  localStorage.setItem(
    "db-store-canvas-v1",
    JSON.stringify(changed),
  );

  const drift = checkPulseContextDrift(
    envelope.binding,
    "hero",
  );

  assert.equal(drift.status, "DRIFT");

  const result = executePulseAction({
    envelope,
    approval,
    draft,
  });

  assert.equal(result.state, "REJECTED");
  assert.equal(result.error, "CONTEXT_STALE");
  assert.equal(result.verified, false);
  assert.equal(
    result.audit.metadata?.context_drift_status,
    "DRIFT",
  );
  assert.equal(
    result.audit.metadata?.expected_context_version,
    contextVersion,
  );

  assert.notEqual(
    result.audit.metadata?.current_context_version,
    contextVersion,
  );

  const audits = JSON.parse(
    localStorage.getItem("db-pulse-audit-v1") || "[]",
  ) as Array<Record<string, unknown>>;

  const persisted = audits.at(-1);

  assert.equal(
    persisted?.reason_code,
    "CONTEXT_STALE",
  );
  assert.equal(
    persisted?.context_drift_status,
    "DRIFT",
  );
  assert.equal(
    persisted?.context_version,
    contextVersion,
  );
  assert.notEqual(
    persisted?.current_context_version,
    contextVersion,
  );
});

test("P0.4.7 acciones read no son bloqueadas", () => {
  const envelope = evaluatePulsePolicy(
    "analyze",
    "L0",
    false,
    "req_p047_read",
    {
      action: "analyze",
      target: "DriftRead:website-builder:analyze",
      actor: "merchant",
      tenant: "DriftRead",
      context_version: "ctx:test",
      proposal: {
        action: "analyze",
      },
    },
  );

  const result = checkPulseContextDrift(
    envelope.binding,
    "analyze",
  );

  assert.equal(result.relevant, false);
  assert.equal(result.status, "MATCH");
});
