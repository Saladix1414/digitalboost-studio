import assert from "node:assert/strict";
import test from "node:test";
import { applyContrastColorsToBlocks, createSvgIconMarkup, createWebsiteExport, getContrastRatio } from "../../src/websites-builder/LocalWebToolsModel.ts";
import { createWebsiteProjectFromBrief, createFallbackBrief, createDesignTokens } from "../../src/WebsitesBuilderModel.ts";

test("contrast utility computes WCAG ratios for common colors", () => {
  assert.equal(getContrastRatio("#000000", "#ffffff"), 21);
  assert.ok(Math.abs(getContrastRatio("#777", "#fff") - 4.478) < 0.01);
});

test("contrast utility rejects malformed colors", () => {
  assert.throws(() => getContrastRatio("blue", "#ffffff"), /hexadecimal válido/);
});

test("applying accessible contrast updates text sections while preserving image and button colors", () => {
  const base = { label: "Test", text: "Contenido", background: "#fff", color: "#111", fontSize: 18, padding: 20, align: "left" as const, width: 100 };
  const blocks = [
    { ...base, id: "text", type: "text" as const },
    { ...base, id: "image", type: "image" as const },
    { ...base, id: "button", type: "button" as const },
  ];
  const next = applyContrastColorsToBlocks(blocks, "#000", "#fff");

  assert.equal(next[0].color, "#000");
  assert.equal(next[0].background, "#fff");
  assert.equal(next[1], blocks[1]);
  assert.equal(next[2], blocks[2]);
  assert.throws(() => applyContrastColorsToBlocks(blocks, "navy", "#fff"), /hexadecimales válidos/);
});

test("SVG icon utility returns self-contained vector markup", () => {
  const svg = createSvgIconMarkup("arrow", "#1689e8");
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /stroke="#1689e8"/);
  assert.throws(() => createSvgIconMarkup("missing", "#000000"), /Ícono no encontrado/);
});

test("project export contains canonical project and canvas blocks", () => {
  const brief = createFallbackBrief("Sitio de prueba");
  const project = createWebsiteProjectFromBrief(brief, createDesignTokens(brief.designLanguage));
  const blocks = [{ id: "hero-1", type: "hero" as const, label: "Hero", text: "Hola", background: "#fff", color: "#000", fontSize: 32, padding: 24, align: "left" as const, width: 100 }];
  const exported = createWebsiteExport(project, blocks);
  assert.equal(exported.format, "digitalboost-websites-builder");
  assert.equal(exported.schemaVersion, 1);
  assert.equal(exported.project?.id, project.id);
  assert.deepEqual(exported.canvas, blocks);
});
