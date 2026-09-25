import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveOpenClawModel,
} from "../../src/server/DigitalBoostOpenClawServer.ts";

test("P0.7.2.1 strict binding selects the exact requested model", () => {
  const result = resolveOpenClawModel(
    "ollama/qwen3:8b",
    [
      "ollama/llama3.2:3b",
      "ollama/qwen3:8b",
    ],
    true,
  );

  assert.deepEqual(result, {
    ok: true,
    model: "ollama/qwen3:8b",
  });
});

test("P0.7.2.1 strict binding rejects an unavailable requested model", () => {
  const result = resolveOpenClawModel(
    "ollama/qwen3:32b",
    [
      "ollama/llama3.2:3b",
      "ollama/qwen3:8b",
    ],
    true,
  );

  assert.deepEqual(result, {
    ok: false,
    error: "MODEL_NOT_FOUND",
  });
});

test("P0.7.2.1 strict binding rejects an empty requested model", () => {
  const result = resolveOpenClawModel(
    undefined,
    [
      "ollama/qwen3:8b",
    ],
    true,
  );

  assert.deepEqual(result, {
    ok: false,
    error: "MODEL_NOT_FOUND",
  });
});

test("P0.7.2.1 strict binding never substitutes another model", () => {
  const result = resolveOpenClawModel(
    "ollama/does-not-exist",
    [
      "ollama/qwen3:8b",
      "ollama/llama3.2:3b",
    ],
    true,
  );

  assert.equal(result.ok, false);
  assert.equal(result.model, undefined);
  assert.equal(result.error, "MODEL_NOT_FOUND");
});

test("P0.7.2.1 legacy mode preserves requested-model selection", () => {
  const result = resolveOpenClawModel(
    "ollama/llama3.2:3b",
    [
      "ollama/qwen3:8b",
      "ollama/llama3.2:3b",
    ],
    false,
  );

  assert.deepEqual(result, {
    ok: true,
    model: "ollama/llama3.2:3b",
  });
});

test("P0.7.2.1 legacy mode preserves Qwen fallback", () => {
  const result = resolveOpenClawModel(
    "ollama/model-unavailable",
    [
      "ollama/llama3.2:3b",
      "ollama/qwen3:8b",
    ],
    false,
  );

  assert.deepEqual(result, {
    ok: true,
    model: "ollama/qwen3:8b",
  });
});

test("P0.7.2.1 legacy mode preserves first-model fallback", () => {
  const result = resolveOpenClawModel(
    undefined,
    [
      "ollama/llama3.2:3b",
      "ollama/mistral:7b",
    ],
    false,
  );

  assert.deepEqual(result, {
    ok: true,
    model: "ollama/llama3.2:3b",
  });
});

test("P0.7.2.1 strict mode returns not-found when discovery is empty", () => {
  const result = resolveOpenClawModel(
    "ollama/qwen3:8b",
    [],
    true,
  );

  assert.deepEqual(result, {
    ok: false,
    error: "MODEL_NOT_FOUND",
  });
});

test("P0.7.2.1 legacy mode returns not-found when discovery is empty", () => {
  const result = resolveOpenClawModel(
    undefined,
    [],
    false,
  );

  assert.deepEqual(result, {
    ok: false,
    error: "MODEL_NOT_FOUND",
  });
});
