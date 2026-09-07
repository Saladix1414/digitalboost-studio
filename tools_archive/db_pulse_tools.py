#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

(src / "DigitalBoostPulseTools.ts").write_text(r"""
export type PulseFacts = {
  store: string;
  range: string;
  live: boolean;
  page: string;
  blocks: number;
  heroTitle: string;
  heroCta: string;
  missingCta: number;
  genericHero: boolean;
  sales: number;
  orders: number;
  ticket: number;
  score: number;
  notes: string[];
};

function mul(range: string) {
  return range === "90d" ? 12 : range === "30d" ? 4 : 1;
}

export function toolInspect(input?: { store?: string; range?: string; live?: boolean }): PulseFacts {
  let store = (input && input.store) || "Aura";
  let range = (input && input.range) || "7d";
  let live = input && typeof input.live === "boolean" ? input.live : true;
  let page = "Inicio";
  let blocks: any[] = [];
  try {
    store = localStorage.getItem("db-active-store-v1") || store;
    range = localStorage.getItem("db-os-range-v1") || range;
    live = localStorage.getItem("db-os-live-v1") !== "0";
    page = localStorage.getItem("db-store-page-v1") || "Inicio";
    const raw = localStorage.getItem("db-store-canvas-v1:" + page) || localStorage.getItem("db-store-canvas-v1") || "[]";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) blocks = parsed;
  } catch {}
  const hero = blocks.find(function (b) { return b && (b.type === "hero" || b.kind === "hero"); }) || blocks[0] || {};
  const heroTitle = String(hero.title || "");
  const heroCta = String(hero.cta || "");
  let missingCta = 0;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b) continue;
    if (b.type === "hero" || b.type === "cta" || b.type === "featured" || b.type === "product") {
      if (!String(b.cta || "").trim()) missingCta++;
    }
  }
  const genericHero = !heroTitle || /extraordinario|welcome|bienvenid|lorem|nueva tienda|crea algo/i.test(heroTitle);
  const m = mul(range);
  const sales = Math.round(474 * m);
  const orders = Math.max(1, Math.round(4 * m));
  const ticket = Math.round(118 * m);
  const notes: string[] = [];
  let score = 55;
  if (live) score += 8; else { score -= 10; notes.push("Live apagado"); }
  if (genericHero) { score -= 15; notes.push("Hero de plantilla"); } else score += 12;
  if (missingCta > 0) { score -= Math.min(18, missingCta * 6); notes.push(missingCta + " bloques sin CTA"); } else score += 10;
  if (heroCta) score += 5; else notes.push("Hero sin botón");
  if (blocks.length < 2) { score -= 8; notes.push("Canvas corto"); }
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return {
    store: store, range: range, live: live, page: page, blocks: blocks.length,
    heroTitle: heroTitle, heroCta: heroCta, missingCta: missingCta, genericHero: genericHero,
    sales: sales, orders: orders, ticket: ticket, score: score, notes: notes
  };
}

export function toolScoreLine(f: PulseFacts) {
  const band = f.score >= 80 ? "sano" : f.score >= 60 ? "justo" : "rojo";
  return "Score " + f.score + "/100 (" + band + ")";
}
""", encoding="utf-8")
print("ok tool Inspect")

sk = src / "DigitalBoostPulseSkills.ts"
sk.write_text(r"""
import type { PulseInput } from "./DigitalBoostPulseKB";
import { toolInspect, toolScoreLine } from "./DigitalBoostPulseTools";
function money(n: number) { return "US$ " + n.toLocaleString("es-AR"); }
function studio(i: PulseInput) {
  return i.section === "website-builder" || i.section === "store-builder" || i.section === "builder";
}
export function skillBriefing(i: PulseInput) {
  const f = toolInspect(i);
  if (studio(i)) {
    const hero = f.heroTitle ? "«" + f.heroTitle + "»" : "vacío";
    return {
      title: "PULSE Design",
      body: "Inspección de " + f.page + " en " + f.store + ": " + f.blocks + " bloques. Hero " + hero + (f.genericHero ? " — sigue siendo plantilla." : ".") + " " + toolScoreLine(f) + ". " + (f.notes.length ? f.notes.join(". ") + "." : "El fold está ordenado.") + " Yo tocaría el hero primero.",
      action: "website-builder",
      label: "Seguir en el canvas",
      draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" }
    };
  }
  return {
    title: "PULSE",
    body: f.store + " · " + f.range + (f.live ? " · live" : " · atención") + ". " + toolScoreLine(f) + ". Cálculo de demo: " + money(f.sales) + " y " + f.orders + " pedidos. " + (f.notes.length ? "En el canvas: " + f.notes.join(", ") + ". " : "") + "Operación: 1047 en preparación y cap fino. ¿Cerramos despacho?",
    action: "dashboard",
    label: "Quedarme acá"
  };
}
export function skillPlan(i: PulseInput) {
  const f = toolInspect(i);
  if (studio(i)) {
    return {
      title: "PULSE Design",
      body: "Plan según la inspección: " + toolScoreLine(f) + ". " + (f.genericHero ? "1) Reescribir hero. " : "1) Hero ya tiene voz, no lo toco primero. ") + (f.missingCta ? "2) Completar " + f.missingCta + " CTA. " : "2) CTA cubiertos. ") + "3) Un theme solo. Abajo el copy si hace falta.",
      action: "website-builder",
      label: "Seguir",
      draft: f.genericHero ? { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" } : undefined
    };
  }
  return {
    title: "PULSE",
    body: "Orden con lo que vi: " + toolScoreLine(f) + ". 1) Despachar 1047. 2) Anotar cap — no comprar todavía. 3) " + (f.genericHero ? "Hero de plantilla cuando pases al canvas." : "El canvas ya tiene voz.") + " 4) Campaña carritos = Pulse Card.",
    action: "orders",
    label: "Ir a Pedidos"
  };
}
export function skillAlerta(i: PulseInput) {
  const f = toolInspect(i);
  if (studio(i)) {
    return {
      title: "PULSE Design",
      body: toolScoreLine(f) + ". " + (f.notes.length ? f.notes.join(". ") + "." : "No hay alerta dura en el canvas.") + " Si el score está bajo, el atajo es el hero.",
      action: "website-builder",
      label: "Seguir",
      draft: f.genericHero ? { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" } : undefined
    };
  }
  return {
    title: "PULSE",
    body: toolScoreLine(f) + ". Rojos operativos: cap, 1047, mobile. " + (f.genericHero ? "Y el hero del canvas sigue genérico." : "") + " Health diagnostica; no escribe inventario.",
    action: "__health",
    label: "Abrir Health"
  };
}
export function skillHero(i?: PulseInput) {
  const f = toolInspect(i);
  const now = f.heroTitle || "sin título";
  return {
    title: "PULSE Design",
    body: "Inspección: el hero de " + f.page + " dice «" + now + "». " + (f.genericHero ? "Es plantilla: no dice qué vendés." : "Ya tiene voz; igual te dejo una alternativa más corta.") + " L1, History revierte.",
    action: "website-builder",
    label: "Aplicar hero",
    draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" }
  };
}
""", encoding="utf-8")
print("ok skills con facts")

kb = src / "DigitalBoostPulseKB.ts"
t = kb.read_text(encoding="utf-8")
if "toolInspect" not in t:
    t = 'import { toolInspect, toolScoreLine } from "./DigitalBoostPulseTools";\n' + t
    t = t.replace(
        "let q = expand(input.q || \"\");",
        """const facts = toolInspect(input);
  if (!input.heroTitle) input.heroTitle = facts.heroTitle;
  if (!input.blockCount) input.blockCount = facts.blocks;
  if (!input.page) input.page = facts.page;
  let q = expand(input.q || "");
""",
        1,
    )
    # inspect skill
    if 'q.indexOf("inspecc")' not in t:
        t = t.replace(
            "if (q.indexOf(\"dataset\") !== -1 || q.indexOf(\"jsonl\") !== -1) {",
            """if (q.indexOf("inspecc") !== -1 || q === "score" || q.indexOf("auditar") !== -1) {
    const f = facts;
    return finish(input, {
      title: "PULSE · Inspect",
      body: toolScoreLine(f) + ". " + f.store + " · " + f.page + " · " + f.blocks + " bloques. Hero: «" + (f.heroTitle || "—") + "». " + (f.notes.length ? f.notes.join(". ") + "." : "Sin notas.") + " Esto salió de localStorage, no lo inventé.",
      action: input.section === "website-builder" ? "website-builder" : "dashboard",
      label: "Seguir"
    });
  }
  if (q.indexOf("dataset") !== -1 || q.indexOf("jsonl") !== -1) {""",
            1,
        )
    kb.write_text(t, encoding="utf-8")
    print("ok kb inspect")
else:
    print("kb ya tenia inspect")

op = src / "DigitalBoostOperator.tsx"
if op.is_file():
    o = op.read_text(encoding="utf-8")
    if "inspeccionar" not in o:
        o = o.replace(
            "hola: \"Hola\"",
            "hola: \"Hola\",\n  inspeccionar: \"Inspeccioná la tienda\",\n  score: \"¿Cuál es el score?\"",
            1,
        )
        o = o.replace(
            '["plan", "El orden de hoy"], ["pedidos", "Ver 1047"], ["alerta", "Qué está rojo"]',
            '["inspeccionar", "Inspeccioná la tienda"], ["plan", "El orden de hoy"], ["alerta", "Qué está rojo"]',
            1,
        )
        o = o.replace(
            '[["hero", "Otro hero"], ["theme", "Cambiar theme"], ["conversion", "Unificar CTAs"]]',
            '[["inspeccionar", "Auditar canvas"], ["hero", "Otro hero"], ["theme", "Cambiar theme"]]',
            1,
        )
        op.write_text(o, encoding="utf-8")
        print("ok chip inspect")
print("LISTO TOOLS")
print("Escribi: inspeccionar  →  score /100 + hero real + CTAs faltantes")
