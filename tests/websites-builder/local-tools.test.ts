import assert from "node:assert/strict";
import test from "node:test";
import { createSvgIconMarkup, createWebsiteExport, getContrastRatio } from "../../src/websites-builder/LocalWebToolsModel.ts";
import { createWebsiteProjectFromBrief, createFallbackBrief, createDesignTokens } from "../../src/WebsitesBuilderModel.ts";

test("contrast utility computes WCAG ratios for common colors", () => {
  assert.equal(getContrastRatio("#000000", "#ffffff"), 21);
  assert.ok(Math.abs(getContrastRatio("#777", "#fff") - 4.478) < 0.01);
});

test("contrast utility rejects malformed colors", () => {
  assert.throws(() => getContrastRatio("blue", "#ffffff"), /hexadecimal válido/);
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
