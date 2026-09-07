#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

# --- tools: genericHero no pega el copy ya aplicado ---
tools = src / "DigitalBoostPulseTools.ts"
if tools.is_file():
    t = tools.read_text(encoding="utf-8")
    t = t.replace(
        "/extraordinario|welcome|bienvenid|lorem|crea algo|nueva tienda/i",
        "/extraordinario|welcome|bienvenid|lorem|crea algo|nueva tienda|hello world/i",
    )
    t = t.replace(
        "const genericHero = !heroTitle || /extraordinario",
        "const genericHero = !heroTitle || heroTitle.length < 8 || /extraordinario",
    )
    tools.write_text(t, encoding="utf-8")
    print("ok inspect")

# --- apply: append snippet as new block ---
app = src / "DigitalBoostPulseApply.ts"
if app.is_file():
    a = app.read_text(encoding="utf-8")
    if "export function appendPulseBlock" not in a:
        a += """
export function appendPulseBlock(block: { type: string; title: string; body: string; cta: string }) {
  const page = (function () { try { return localStorage.getItem("db-store-page-v1") || "Inicio"; } catch { return "Inicio"; } })();
  const key = "db-store-canvas-v1:" + page;
  let blocks: any[] = [];
  try {
    const raw = localStorage.getItem(key) || localStorage.getItem("db-store-canvas-v1") || "[]";
    const p = JSON.parse(raw);
    if (Array.isArray(p)) blocks = p;
  } catch {}
  const next = blocks.concat([Object.assign({ id: "db-" + Date.now() }, block)]);
  try {
    localStorage.setItem(key, JSON.stringify(next));
    localStorage.setItem("db-store-canvas-v1", JSON.stringify(next));
  } catch {}
  try {
    const w = window as any;
    if (typeof w.__dbSetBlocks === "function") w.__dbSetBlocks(next);
  } catch {}
  window.dispatchEvent(new CustomEvent("db-canvas-reload", { detail: next }));
  return true;
}
"""
        app.write_text(a, encoding="utf-8")
        print("ok append")

# --- dock: hide under PULSE + snippets append ---
dock = src / "DigitalBoostStudioDock.tsx"
if dock.is_file():
    d = dock.read_text(encoding="utf-8")
    if "appendPulseBlock" not in d:
        d = d.replace(
            'import { applyPulseDraft } from "./DigitalBoostPulseApply";',
            'import { applyPulseDraft, appendPulseBlock } from "./DigitalBoostPulseApply";',
            1,
        )
    d = d.replace(
        "applyPulseDraft({ kind: s.kind, title: s.title, body: s.body, cta: s.cta });",
        "if (s.kind === 'hero') applyPulseDraft({ kind: 'hero', title: s.title, body: s.body, cta: s.cta }); else appendPulseBlock({ type: s.id, title: s.title, body: s.body, cta: s.cta });",
        1,
    )
    if "pulseOpen" not in d:
        d = d.replace(
            "const open = tab !== null;",
            "const open = tab !== null;\n  const pulseOpen = typeof document !== 'undefined' && !!document.querySelector('[role=\"dialog\"]');\n  if (pulseOpen) return null;",
            1,
        )
        print("ok hide under pulse")
    dock.write_text(d, encoding="utf-8")
    print("ok dock")

# --- skills: segundo hero si ya aplicaron ---
sk = src / "DigitalBoostPulseSkills.ts"
if sk.is_file():
    s = sk.read_text(encoding="utf-8")
    if "La pieza que se explica sola" not in s:
        s = s.replace(
            'draft: { kind: "hero", title: "La coleccion que no pide permiso.", body: "Una promesa. Un boton.", cta: "Entrar" }',
            'draft: f.heroTitle && f.heroTitle.indexOf("permiso") !== -1 ? { kind: "hero", title: "La pieza que se explica sola.", body: "Menos texto. Un solo boton.", cta: "Entrar" } : { kind: "hero", title: "La coleccion que no pide permiso.", body: "Una promesa. Un boton.", cta: "Entrar" }',
        )
        s = s.replace(
            'draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" }',
            'draft: f.heroTitle && f.heroTitle.indexOf("permiso") !== -1 ? { kind: "hero", title: "La pieza que se explica sola.", body: "Menos texto. Un solo boton.", cta: "Entrar" } : { kind: "hero", title: "La coleccion que no pide permiso.", body: "Una promesa. Un boton.", cta: "Entrar" }',
        )
        sk.write_text(s, encoding="utf-8")
        print("ok segundo hero")

print("LISTO NEXT")
print("1) Inspect ya no marca el hero nuevo como plantilla")
print("2) Snippets FAQ/VIP agregan bloque")
print("3) Dock se esconde si PULSE esta abierto")
