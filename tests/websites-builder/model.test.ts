import test from "node:test";
import assert from "node:assert/strict";

import {
  briefToBuilderBlocks,
  createDesignTokens,
  createFallbackBrief,
  normalizeBrief,
  verifyWebsitesBuilderProject,
} from "../../src/WebsitesBuilderModel.ts";

test("fallback creates four blocks without fake proof", () => {
  const brief = createFallbackBrief(
    "Sitio para estudio de arquitectura residencial premium",
    "web",
    "Commerce Luxury"
  );

  const tokens =
    createDesignTokens(
      brief.designLanguage
    );

  const blocks =
    briefToBuilderBlocks(
      brief,
      tokens
    );

  assert.equal(
    blocks.length,
    4
  );

  assert.equal(
    blocks[0].type,
    "hero"
  );

  assert.equal(
    brief.proof,
    "Por definir"
  );
});

test("unknown design language is rejected", () => {
  const fallback =
    createFallbackBrief(
      "Plataforma de datos",
      "web",
      "Data Native"
    );

  const normalized =
    normalizeBrief(
      {
        ...fallback,
        designLanguage:
          "Generic SaaS Gradient",
      },
      fallback
    );

  assert.equal(
    normalized.designLanguage,
    "Data Native"
  );
});

test("verification reports EMPTY data state", () => {
  const prompt =
    "Website para plataforma de análisis empresarial";

  const brief =
    createFallbackBrief(
      prompt,
      "web",
      "Data Native"
    );

  const tokens =
    createDesignTokens(
      brief.designLanguage
    );

  const blocks =
    briefToBuilderBlocks(
      brief,
      tokens
    );

  const result =
    verifyWebsitesBuilderProject(
      prompt,
      brief,
      tokens,
      blocks
    );

  assert.equal(
    result.passed,
    true
  );

  const data =
    result.checks.find(
      check =>
        check.id === "data"
    );

  assert.equal(
    data?.detail.includes("EMPTY"),
    true
  );
});
