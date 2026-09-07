#!/usr/bin/env python3
from pathlib import Path
import re

src = Path("src")
app = src / "DigitalBoostPulseApply.ts"
if not app.is_file():
    raise SystemExit("cd digitalboost-studio y corre antes db_pulse_wire.py")

app.write_text(r"""
export type PulseDraft = { kind: string; title: string; body: string; cta: string };

function readBlocks(page: string) {
  const keys = ["db-store-canvas-v1:" + page, "db-store-canvas-v1"];
  for (let i = 0; i < keys.length; i++) {
    try {
      const raw = localStorage.getItem(keys[i]);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return { key: keys[i], blocks: parsed };
    } catch {}
  }
  return { key: "db-store-canvas-v1:" + page, blocks: [] as any[] };
}

function pushLive(next: any[]) {
  try {
    const w = window as any;
    if (typeof w.__dbSetBlocks === "function") w.__dbSetBlocks(next);
    if (typeof w.__dbSetCanvas === "function") w.__dbSetCanvas(next);
  } catch {}
}

export function applyPulseDraft(draft: PulseDraft) {
  const page = (function () {
    try { return localStorage.getItem("db-store-page-v1") || "Inicio"; } catch { return "Inicio"; }
  })();
  if (draft.kind === "theme") {
    const theme = /noir/i.test(draft.title + draft.body) ? "noir" : "aura";
    try { localStorage.setItem("db-os-theme-v1", theme); } catch {}
    try { document.documentElement.setAttribute("data-theme", theme); } catch {}
    window.dispatchEvent(new Event("db-theme-reload"));
    return true;
  }
  const bag = readBlocks(page);
  if (!bag.blocks.length) return false;
  const next = bag.blocks.map(function (b: any) {
    if (draft.kind === "hero" && b && b.type === "hero") {
      return Object.assign({}, b, { title: draft.title, body: draft.body, cta: draft.cta });
    }
    if (draft.kind === "cta" && b) {
      if (b.type === "hero" || b.cta) return Object.assign({}, b, { cta: draft.cta || "Comprar ahora" });
    }
    return b;
  });
  try {
    localStorage.setItem(bag.key, JSON.stringify(next));
    localStorage.setItem("db-store-canvas-v1", JSON.stringify(next));
  } catch {}
  pushLive(next);
  window.dispatchEvent(new CustomEvent("db-canvas-reload", { detail: next }));
  return true;
}
""", encoding="utf-8")
print("ok apply live")

ws = src / "StoreBuilderWorkspace.tsx"
w = ws.read_text(encoding="utf-8") if ws.is_file() else ""
hooked = False
for setter in ("setBlocks", "setCanvasBlocks", "setPageBlocks", "setCanvas", "setDoc"):
    if not w or setter not in w:
        continue
    needle = "const [" 
    # expose window.__dbSetBlocks = setter once
    marker = "__dbSetBlocks"
    if marker in w:
        hooked = True
        print("ya expuesto")
        break
    # insert after first occurrence of the setter's useState line is fragile;
    # add an effect near showAI
    blob = """
  useEffect(function () {
    try { (window as any).__dbSetBlocks = """ + setter + """; } catch {}
    function pull(ev: any) {
      const next = ev && ev.detail;
      if (Array.isArray(next) && next.length) """ + setter + """(next);
    }
    window.addEventListener("db-canvas-reload", pull as any);
    return function () { window.removeEventListener("db-canvas-reload", pull as any); };
  }, []);
"""
    if "const [showAI, setShowAI] = useState(false);" in w:
        w = w.replace(
            "const [showAI, setShowAI] = useState(false);",
            "const [showAI, setShowAI] = useState(false);" + blob,
            1,
        )
        hooked = True
        print("ok hook", setter)
        break
    # fallback: after function component open is too hard
if w and "useEffect" not in w.split("from \"react\"")[0][-200:]:
    w = w.replace("import { useState", "import { useEffect, useState", 1)
    w = w.replace("import { useMemo, useState", "import { useEffect, useMemo, useState", 1)
if w:
    ws.write_text(w, encoding="utf-8")
if not hooked:
    print("WARN no encontre setBlocks — el apply igual escribe localStorage")

# theme draft in operator follows already; add draft on theme via KB finish — skip
print("LISTO HOOK")
print("Aplicar llama window.__dbSetBlocks si el studio lo expuso")
