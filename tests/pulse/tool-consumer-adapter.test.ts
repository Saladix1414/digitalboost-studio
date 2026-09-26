import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  createPulseToolConsumerContext,
  createPulseToolConsumerContextFromInput,
  invokePulseToolForConsumer,
} from "../../src/DigitalBoostPulseToolConsumerAdapter.ts";

test(
  "P0.8.6 contract is explicit",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "dashboard",
        q:
          "analizar",
        tenantId:
          "tenant-a",
        requestId:
          "req-p086-a",
        agentId:
          "pulse",
        intent:
          "analysis",
      });

    assert.equal(
      context.contract,
      "p0.8.6",
    );
  },
);

test(
  "explicit tenant attribution is preserved",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "dashboard",
        q:
          "analizar",
        tenantId:
          "tenant-a",
        requestId:
          "req-p086-b",
        agentId:
          "pulse",
        intent:
          "analysis",
      });

    assert.equal(
      context.tenantId,
      "tenant-a",
    );

    assert.equal(
      context.tenantSource,
      "EXPLICIT",
    );

    assert.equal(
      context.legacyTenant,
      false,
    );
  },
);

test(
  "legacy tenant attribution is explicit and non-authoritative",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "dashboard",
        q:
          "analizar",
        requestId:
          "req-p086-c",
        agentId:
          "pulse",
        intent:
          "analysis",
      });

    assert.equal(
      context.tenantId,
      "digitalboost",
    );

    assert.equal(
      context.tenantSource,
      "LEGACY_DEFAULT",
    );

    assert.equal(
      context.legacyTenant,
      true,
    );
  },
);

test(
  "request identity can be explicitly reused",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "dashboard",
        q:
          "analizar",
        requestId:
          "req-p086-shared",
        agentId:
          "pulse",
        intent:
          "analysis",
      });

    const a =
      invokePulseToolForConsumer(
        context,
        "pulse.inspect",
      );

    const b =
      invokePulseToolForConsumer(
        context,
        "pulse.inspect",
      );

    assert.equal(
      a.context.requestId,
      "req-p086-shared",
    );

    assert.equal(
      b.context.requestId,
      "req-p086-shared",
    );
  },
);

test(
  "context identity must be supplied as a pair",
  () => {
    assert.throws(
      () =>
        createPulseToolConsumerContext({
          section:
            "dashboard",
          q:
            "analizar",
          requestId:
            "req-p086-context",
          agentId:
            "pulse",
          intent:
            "analysis",
          contextId:
            "ctx-a",
        }),
      /P0\.8\.6_CONTEXT_BINDING_INCOMPLETE/,
    );
  },
);

test(
  "complete context identity is preserved",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "dashboard",
        q:
          "analizar",
        requestId:
          "req-p086-context-ok",
        agentId:
          "pulse",
        intent:
          "analysis",
        contextId:
          "ctx-a",
        contextVersion:
          "ctx-v1",
      });

    assert.equal(
      context.contextId,
      "ctx-a",
    );

    assert.equal(
      context.contextVersion,
      "ctx-v1",
    );
  },
);

test(
  "agent can be resolved from existing intent and section rules",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "website-builder",
        q:
          "hero",
      });

    assert.equal(
      context.agentId,
      "design",
    );
  },
);

test(
  "explicit agent and intent override are deterministic",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "dashboard",
        q:
          "anything",
        agentId:
          "ops",
        intent:
          "analysis",
      });

    assert.equal(
      context.agentId,
      "ops",
    );

    assert.equal(
      context.intent,
      "analysis",
    );
  },
);

test(
  "registered observation tool is invoked through canonical boundary",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "dashboard",
        q:
          "analizar",
        tenantId:
          "tenant-a",
        requestId:
          "req-p086-observe",
        agentId:
          "pulse",
        intent:
          "analysis",
      });

    const result =
      invokePulseToolForConsumer<{
        score: number;
        store: string;
      }>(
        context,
        "pulse.inspect",
      );

    assert.equal(
      result.contract,
      "p0.8.6",
    );

    assert.equal(
      result.toolId,
      "pulse.inspect",
    );

    assert.equal(
      result.purpose,
      "OBSERVE",
    );

    assert.equal(
      result.evidence.contract,
      "p0.8.5",
    );

    assert.equal(
      result.evidence.authority,
      "NONE",
    );

    assert.equal(
      result.evidence.sideEffect,
      "NONE",
    );

    assert.equal(
      result.evidence.requestId,
      "req-p086-observe",
    );
  },
);

test(
  "proposal tool receives PROPOSE purpose automatically from registry",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "dashboard",
        q:
          "siguiente",
        tenantId:
          "tenant-a",
        requestId:
          "req-p086-proposal",
        agentId:
          "pulse",
        intent:
          "recommendation",
      });

    const result =
      invokePulseToolForConsumer(
        context,
        "pulse.nba",
      );

    assert.equal(
      result.purpose,
      "PROPOSE",
    );

    assert.equal(
      result.evidence.contract,
      "p0.8.5",
    );
  },
);

test(
  "unbound agent-tool relationship fails closed",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "dashboard",
        q:
          "ventas",
        requestId:
          "req-p086-deny",
        agentId:
          "sales",
        intent:
          "catalog",
      });

    const result =
      invokePulseToolForConsumer(
        context,
        "pulse.score",
      );

    assert.equal(
      result.evidence.outcome,
      "POLICY_DENIED",
    );

    assert.equal(
      result.evidence.invoked,
      false,
    );

    assert.equal(
      result.evidence.policyDecision,
      "DENY",
    );

    assert.ok(
      result.evidence.policyReasons.includes(
        "TOOL_NOT_BOUND_TO_AGENT",
      ),
    );
  },
);

test(
  "consumer adapter rejects unknown tools before invocation",
  () => {
    const context =
      createPulseToolConsumerContext({
        section:
          "dashboard",
        q:
          "analizar",
        requestId:
          "req-p086-unknown",
        agentId:
          "pulse",
        intent:
          "analysis",
      });

    assert.throws(
      () =>
        invokePulseToolForConsumer(
          context,
          "pulse.unknown",
        ),
      /P0\.8\.6_UNKNOWN_TOOL/,
    );
  },
);

test(
  "PulseInput context propagation is preserved",
  () => {
    const context =
      createPulseToolConsumerContextFromInput({
        q:
          "analizar",
        section:
          "dashboard",
        store:
          "store-a",
        live:
          true,
        range:
          "7d",
        requestId:
          "req-from-input",
        tenantId:
          "tenant-input",
        contextId:
          "ctx-input",
        contextVersion:
          "ctx-v1",
      });

    assert.equal(
      context.requestId,
      "req-from-input",
    );

    assert.equal(
      context.tenantId,
      "tenant-input",
    );

    assert.equal(
      context.contextId,
      "ctx-input",
    );

    assert.equal(
      context.contextVersion,
      "ctx-v1",
    );
  },
);

test(
  "adapter source does not import the raw tool implementation module",
  () => {
    const file =
      path.resolve(
        "src/DigitalBoostPulseToolConsumerAdapter.ts",
      );

    const source =
      fs.readFileSync(
        file,
        "utf8",
      );

    assert.equal(
      /from ["']\.\/DigitalBoostPulseTools["']/.test(
        source,
      ),
      false,
    );
  },
);
test(
  "P0.8.6-B consumers do not import or directly call raw tools",
  () => {
    const files = [
      "src/DigitalBoostPulseRouter.ts",
      "src/DigitalBoostPulseSkills.ts",
      "src/DigitalBoostPulseKB.ts",
      "src/DigitalBoostPulseOptimize.ts",
      "src/DigitalBoostStudioDock.tsx",
    ];

    for (const file of files) {
      const source =
        fs.readFileSync(
          path.resolve(file),
          "utf8",
        );

      assert.doesNotMatch(
        source,
        /DigitalBoostPulseTools/,
        `${file} imports raw DigitalBoostPulseTools`,
      );

      assert.doesNotMatch(
        source,
        /tool(Inspect|ScoreLine|Map|Nba|Orders|Stock|Theme|Diff|Range)\s*\(/,
        `${file} contains a direct raw tool call`,
      );

      assert.match(
        source,
        /invokePulseToolForConsumer/,
        `${file} is not using the canonical consumer adapter`,
      );
    }
  },
);

test(
  "P0.8.6-B adapter is the only consumer-to-evidence bridge",
  () => {
    const source =
      fs.readFileSync(
        path.resolve(
          "src/DigitalBoostPulseToolConsumerAdapter.ts",
        ),
        "utf8",
      );

    assert.match(
      source,
      /invokePulseToolWithEvidence/,
    );

    assert.doesNotMatch(
      source,
      /DigitalBoostPulseTools/,
    );
  },
);
