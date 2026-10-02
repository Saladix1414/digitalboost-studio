import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function read(relative: string): string {
  return fs.readFileSync(
    new URL(`../../${relative}`, import.meta.url),
    "utf8"
  );
}

test("Phase 20 has canonical production-readiness documentation", () => {
  const content = read(
    "docs/trading-islands/phase-20-runtime-evidence-production-readiness.md"
  );

  for (const requirement of [
    "RUNTIME VERIFIED",
    "SECURITY REVIEWED",
    "TELEMETRY ENABLED",
    "REGRESSION VERIFIED",
    "DOCUMENTED",
    "PRODUCTION READY",
  ]) {
    assert.ok(content.includes(requirement));
  }
});

test("Phase 20 preserves authority invariants", () => {
  const content = read(
    "docs/trading-islands/phase-20-runtime-evidence-production-readiness.md"
  );

  for (const invariant of [
    "EVIDENCE != AUTHORITY",
    "TELEMETRY != AUTHORITY",
    "PERSISTENCE != AUTHORITY",
    "RECONCILIATION != APPROVAL",
    "WEB LOCK != AUTHORITY",
    "MEMORY != GOVERNANCE",
    "FAILURE != EXECUTION",
    "AI OUTPUT != AUTHORITY",
  ]) {
    assert.ok(content.includes(invariant));
  }
});

test("Phase 20 implementation exposes production capabilities", () => {
  const store = read(
    "src/trading/runtime/runtimeEvidenceStore.ts"
  );

  const coordinator = read(
    "src/trading/runtime/runtimeEvidenceCoordination.ts"
  );

  for (const capability of [
    "hydrateRuntimeEvidence",
    "persistRuntimeEvidenceHistory",
    "reconcileStaleRuntimeEvidence",
    "getRuntimeEvidenceCoordinationHealth",
    "recordRuntimeEvidenceReconciliationAttempt",
  ]) {
    assert.ok(store.includes(capability));
  }

  assert.match(coordinator, /crossContextSafe/);
  assert.doesNotMatch(coordinator, /authoritative:\s*true/);
});

test("Phase 20 diagnostics remain observational", () => {
  const diagnostics = read(
    "src/trading/activity/RuntimeEvidenceDiagnostics.tsx"
  );

  const crossTab = read(
    "src/trading/activity/RuntimeEvidenceCrossTabDiagnostics.tsx"
  );

  assert.doesNotMatch(
    `${diagnostics}\n${crossTab}`,
    /runBotRuntimeSession|executePaperOrder|approveRiskReview|createRiskReview/
  );
});

test("Phase 20 documentation explicitly excludes PULSE", () => {
  const content = read(
    "docs/trading-islands/phase-20-runtime-evidence-production-readiness.md"
  );

  assert.ok(content.includes("PULSE boundary"));
  assert.ok(content.includes("independent from PULSE"));
});
