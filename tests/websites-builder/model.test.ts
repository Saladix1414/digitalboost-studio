import test from "node:test";
import assert from "node:assert/strict";

import {
  briefToBuilderBlocks,
  createDesignTokens,
  createFallbackBrief,
  createWebsiteProjectFromBrief,
  createWebsitePage,
  deleteWebsitePage,
  getWebsiteHomePage,
  normalizeBrief,
  updateWebsiteProjectFromCanvas,
  updateWebsitePageSeo,
  updateWebsitePageDetails,
  updateWebsiteProjectDesignTokens,
  verifyWebsitesBuilderProject,
  websiteProjectToCanvasBlocks,
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

test("canonical website project preserves brief kind and creates Home", () => {
  const brief = createFallbackBrief(
    "Landing editorial para captar consultas",
    "landing",
    "Digital Editorial"
  );

  const tokens = createDesignTokens(
    brief.designLanguage
  );

  const project =
    createWebsiteProjectFromBrief(
      brief,
      tokens
    );

  assert.equal(project.schemaVersion, 1);
  assert.equal(project.kind, "landing");
  assert.equal(project.status, "draft");
  assert.equal(project.pages.length, 1);
  assert.equal(project.pages[0].slug, "/");
  assert.equal(project.pages[0].sections.length, 4);

  assert.equal(
    project.governance.authority,
    "proposal-only"
  );

  assert.equal(
    project.governance.execution,
    "user-approved"
  );

  assert.equal(
    project.governance.publishing,
    "preview-only"
  );
});

test("website project round-trips through the canvas projection", () => {
  const brief = createFallbackBrief(
    "Website para un estudio de arquitectura",
    "web",
    "Digital Editorial"
  );

  const tokens = createDesignTokens(
    brief.designLanguage
  );

  const project =
    createWebsiteProjectFromBrief(
      brief,
      tokens
    );

  const blocks =
    websiteProjectToCanvasBlocks(
      project
    );

  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].id, "canonical-hero");
  assert.equal(blocks[1].id, "canonical-value");
  assert.equal(blocks[2].id, "canonical-proof");
  assert.equal(blocks[3].id, "canonical-cta");

  const edited = blocks.map(
    (block) =>
      block.id === "canonical-hero"
        ? {
            ...block,
            text: "Headline editado",
            align: "center" as const,
            fontSize: 52,
            minHeight: 740,
            offsetX: 24,
            offsetY: -12,
            paddingX: 72,
            paddingY: 56,
            borderStyle: "solid" as const,
            borderWidth: 3,
            borderColor: "#1a2b3c",
            borderRadius: 20,
            shadow: "glow" as const,
            hidden: true,
          }
        : block
  );

  const updated =
    updateWebsiteProjectFromCanvas(
      project,
      edited
    );

  const projected =
    websiteProjectToCanvasBlocks(
      updated
    );

  assert.equal(
    projected[0].text,
    "Headline editado"
  );

  assert.equal(
    projected[0].align,
    "center"
  );

  assert.equal(
    projected[0].fontSize,
    52
  );
  assert.equal(projected[0].minHeight, 740);
  assert.equal(projected[0].offsetX, 24);
  assert.equal(projected[0].offsetY, -12);
  assert.equal(projected[0].paddingX, 72);
  assert.equal(projected[0].paddingY, 56);
  assert.equal(projected[0].borderStyle, "solid");
  assert.equal(projected[0].borderWidth, 3);
  assert.equal(projected[0].borderColor, "#1a2b3c");
  assert.equal(projected[0].borderRadius, 20);
  assert.equal(projected[0].shadow, "glow");
  assert.equal(projected[0].hidden, true);

  assert.equal(
    getWebsiteHomePage(updated)
      .sections.length,
    4
  );
});

test("canvas order and deletion become canonical project structure", () => {
  const brief = createFallbackBrief(
    "Website de servicios profesionales",
    "web",
    "Soft Precision"
  );

  const tokens = createDesignTokens(
    brief.designLanguage
  );

  const project =
    createWebsiteProjectFromBrief(
      brief,
      tokens
    );

  const blocks =
    websiteProjectToCanvasBlocks(
      project
    );

  const changed = [
    blocks[3],
    blocks[0],
    blocks[1],
  ];

  const updated =
    updateWebsiteProjectFromCanvas(
      project,
      changed
    );

  const projected =
    websiteProjectToCanvasBlocks(
      updated
    );

  assert.deepEqual(
    projected.map((block) => block.id),
    [
      "canonical-cta",
      "canonical-hero",
      "canonical-value",
    ]
  );
});

test("SEO edits stay attached to the canonical Home page", () => {
  const brief = createFallbackBrief(
    "Sitio para estudio creativo",
    "web",
    "Digital Editorial"
  );
  const project = createWebsiteProjectFromBrief(
    brief,
    createDesignTokens(brief.designLanguage)
  );
  const home = getWebsiteHomePage(project);
  const updated = updateWebsitePageSeo(project, home.id, {
    title: "Estudio creativo | Inicio",
    description: "Diseño e identidad para marcas.",
    indexable: false,
  });

  assert.equal(getWebsiteHomePage(updated).seo.title, "Estudio creativo | Inicio");
  assert.equal(getWebsiteHomePage(updated).seo.description, "Diseño e identidad para marcas.");
  assert.equal(getWebsiteHomePage(updated).seo.indexable, false);
  assert.equal(getWebsiteHomePage(project).seo.indexable, true);
});

test("pages can be added, renamed, slugged, and removed without touching Home", () => {
  const brief = createFallbackBrief("Sitio multipágina");
  const project = createWebsiteProjectFromBrief(brief, createDesignTokens(brief.designLanguage));
  const home = getWebsiteHomePage(project);
  const withPage = createWebsitePage(project, "Servicios");
  const page = withPage.pages[1];

  assert.equal(page.name, "Servicios");
  assert.equal(page.slug, "/servicios");
  assert.equal(page.sections.length, 0);
  assert.equal(createWebsitePage(withPage, "Servicios").pages[2].slug, "/servicios-2");

  const edited = updateWebsitePageDetails(withPage, page.id, { title: "Nuestros servicios", slug: "solución de negocio" });
  assert.equal(edited.pages[1].title, "Nuestros servicios");
  assert.equal(edited.pages[1].slug, "/solucion-de-negocio");
  assert.equal(deleteWebsitePage(edited, home.id), edited);
  assert.equal(deleteWebsitePage(edited, page.id).pages.length, 1);
});

test("canvas projection targets the selected page", () => {
  const brief = createFallbackBrief("Sitio con páginas");
  const project = createWebsiteProjectFromBrief(brief, createDesignTokens(brief.designLanguage));
  const home = getWebsiteHomePage(project);
  const withPage = createWebsitePage(project, "Contacto");
  const page = withPage.pages[1];
  const pageBlocks = [{ id: "contact-hero", type: "hero" as const, label: "Contacto", text: "Escribinos", background: "#fff", color: "#000", fontSize: 32, padding: 24, align: "left" as const, width: 100 }];
  const updated = updateWebsiteProjectFromCanvas(withPage, pageBlocks, page.id);

  assert.equal(websiteProjectToCanvasBlocks(updated, page.id)[0].id, "contact-hero");
  assert.equal(updated.pages.find((entry) => entry.id === home.id)?.sections.length, home.sections.length);
});

test("design token updates are immutable and merge only selected values", () => {
  const brief = createFallbackBrief("Sitio con sistema visual");
  const tokens = createDesignTokens(brief.designLanguage);
  const project = createWebsiteProjectFromBrief(brief, tokens);
  const updated = updateWebsiteProjectDesignTokens(project, {
    accent: "#ff5c35",
    radius: 24,
  });

  assert.equal(updated.designTokens.accent, "#ff5c35");
  assert.equal(updated.designTokens.radius, 24);
  assert.equal(updated.designTokens.background, tokens.background);
  assert.equal(project.designTokens.accent, tokens.accent);
});
