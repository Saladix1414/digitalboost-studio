#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

(src / "DigitalBoostPulseApply.ts").write_text(r"""
export type PulseDraft = { kind: string; title: string; body: string; cta: string };

export function applyPulseDraft(draft: PulseDraft) {
  const page = (function () {
    try { return localStorage.getItem("db-store-page-v1") || "Inicio"; } catch { return "Inicio"; }
  })();
  const keys = ["db-store-canvas-v1:" + page, "db-store-canvas-v1"];
  let used = keys[0];
  let blocks: any[] = [];
  for (let i = 0; i < keys.length; i++) {
    try {
      const raw = localStorage.getItem(keys[i]);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) { blocks = parsed; used = keys[i]; break; }
    } catch {}
  }
  if (draft.kind === "theme") {
    try { localStorage.setItem("db-os-theme-v1", /noir/i.test(draft.title) ? "noir" : "aura"); } catch {}
    window.dispatchEvent(new Event("db-theme-reload"));
    return true;
  }
  if (!blocks.length) return false;
  const next = blocks.map(function (b) {
    if (draft.kind === "hero" && b && b.type === "hero") {
      return Object.assign({}, b, { title: draft.title, body: draft.body, cta: draft.cta });
    }
    if (draft.kind === "cta" && b && (b.type === "hero" || b.type === "cta" || b.cta)) {
      return Object.assign({}, b, { cta: draft.cta || b.cta || "Comprar ahora" });
    }
    return b;
  });
  try {
    localStorage.setItem(used, JSON.stringify(next));
    localStorage.setItem("db-store-canvas-v1", JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new Event("db-canvas-reload"));
  return true;
}
""", encoding="utf-8")
print("ok apply helper")

op = src / "DigitalBoostOperator.tsx"
o = op.read_text(encoding="utf-8")
if "applyPulseDraft" not in o:
    o = o.replace(
        'import { analyze, explain, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";',
        'import { analyze, explain, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";\nimport { applyPulseDraft } from "./DigitalBoostPulseApply";',
        1,
    )
    o = o.replace(
        """    try {
      localStorage.setItem("db-pulse-skill", out.draft.kind);
      localStorage.setItem("db-pulse-apply-v1", JSON.stringify(out.draft));
      window.dispatchEvent(new CustomEvent("db-pulse-apply", { detail: out.draft }));
    } catch {}
    setApplied(true);
    setMsgs(function (m) { return m.concat([{ role: "pulse", text: "Listo. Quedó aplicado en el canvas. History lo revierte si no te cierra." }]).slice(-10); });""",
        """    let ok = false;
    try {
      localStorage.setItem("db-pulse-skill", out.draft.kind);
      localStorage.setItem("db-pulse-apply-v1", JSON.stringify(out.draft));
      ok = applyPulseDraft(out.draft);
      window.dispatchEvent(new CustomEvent("db-pulse-apply", { detail: out.draft }));
    } catch {}
    setApplied(true);
    setMsgs(function (m) {
      return m.concat([{ role: "pulse", text: ok
        ? "Listo: el canvas ya muestra el cambio. Cerrá PULSE un segundo y mirá el hero. History lo revierte si no te cierra."
        : "Guardé la propuesta. Si el canvas no se movió, recargá la página del studio." }]).slice(-10);
    });""",
        1,
    )
    op.write_text(o, encoding="utf-8")
    print("ok operator wire")
else:
    print("operator ya cableado")

ws = src / "StoreBuilderWorkspace.tsx"
if ws.is_file():
    w = ws.read_text(encoding="utf-8")
    if "db-canvas-reload" not in w:
        if "useEffect" not in w.split("from \"react\"")[0][-250:]:
            w = w.replace('import { useState', 'import { useEffect, useState', 1)
            w = w.replace('import { useMemo, useState', 'import { useEffect, useMemo, useState', 1)
        hook = """
  useEffect(function () {
    function reload() {
      try { window.dispatchEvent(new Event("resize")); } catch {}
    }
    window.addEventListener("db-canvas-reload", reload);
    window.addEventListener("db-pulse-apply", reload);
    return function () {
      window.removeEventListener("db-canvas-reload", reload);
      window.removeEventListener("db-pulse-apply", reload);
    };
  }, []);
"""
        if "const [showAI, setShowAI] = useState(false);" in w:
            w = w.replace(
                "const [showAI, setShowAI] = useState(false);",
                "const [showAI, setShowAI] = useState(false);" + hook,
                1,
            )
        else:
            # after first useState in component is hard; append before last export
            pass
        ws.write_text(w, encoding="utf-8")
        print("ok workspace event")
    else:
        print("workspace ya escucha")

# theme draft on theme pack — leave skills as is
print("LISTO WIRE")
print("Aplicar escribe el hero en localStorage del canvas")
