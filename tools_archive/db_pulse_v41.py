#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not (src / "DigitalBoostOperator.tsx").is_file():
    raise SystemExit("cd digitalboost-studio")

(src / "DigitalBoostPulseApply.ts").write_text(r"""
export type PulseDraft = { kind: string; title: string; body: string; cta: string };

function pageName() {
  try { return localStorage.getItem("db-store-page-v1") || "Inicio"; } catch { return "Inicio"; }
}
function readBlocks() {
  const page = pageName();
  const keys = ["db-store-canvas-v1:" + page, "db-store-canvas-v1"];
  for (let i = 0; i < keys.length; i++) {
    try {
      const parsed = JSON.parse(localStorage.getItem(keys[i]) || "null");
      if (Array.isArray(parsed) && parsed.length) return { key: keys[i], blocks: parsed };
    } catch {}
  }
  return { key: "db-store-canvas-v1:" + pageName(), blocks: [] as any[] };
}
function live(next: any[]) {
  try {
    const w = window as any;
    if (typeof w.__dbSetBlocks === "function") w.__dbSetBlocks(next);
    if (typeof w.__dbSetCanvas === "function") w.__dbSetCanvas(next);
  } catch {}
}

export function applyPulseDraft(draft: PulseDraft) {
  if (draft.kind === "theme") {
    const theme = /noir/i.test(draft.title + " " + draft.body) ? "noir" : "aura";
    try { localStorage.setItem("db-os-theme-v1", theme); } catch {}
    try { document.documentElement.setAttribute("data-theme", theme); } catch {}
    window.dispatchEvent(new Event("db-theme-reload"));
    return true;
  }
  const bag = readBlocks();
  let blocks = bag.blocks.slice();
  if (!blocks.length) {
    blocks = [{ id: "hero", type: "hero", title: draft.title, body: draft.body, cta: draft.cta }];
  }
  let hit = false;
  const next = blocks.map(function (b: any) {
    const isHero = b && (b.type === "hero" || b.kind === "hero" || b.block === "hero");
    if (draft.kind === "hero" && isHero) {
      hit = true;
      return Object.assign({}, b, { title: draft.title, body: draft.body, cta: draft.cta || b.cta });
    }
    if (draft.kind === "cta" && b && (isHero || b.cta || b.type === "cta")) {
      hit = true;
      return Object.assign({}, b, { cta: draft.cta || "Comprar ahora" });
    }
    return b;
  });
  if (draft.kind === "hero" && !hit && next[0]) {
    next[0] = Object.assign({}, next[0], { title: draft.title, body: draft.body, cta: draft.cta || next[0].cta });
  }
  try {
    localStorage.setItem(bag.key, JSON.stringify(next));
    localStorage.setItem("db-store-canvas-v1", JSON.stringify(next));
  } catch {}
  live(next);
  window.dispatchEvent(new CustomEvent("db-canvas-reload", { detail: next }));
  return true;
}
""", encoding="utf-8")
print("ok apply 4.1")

kb = src / "DigitalBoostPulseKB.ts"
t = kb.read_text(encoding="utf-8")
if "injectDraft" not in t:
    t = t.replace(
        "packs.sort(function (a, b) { return b.score - a.score; });",
        """packs.sort(function (a, b) { return b.score - a.score; });
  function injectDraft(p: Pack) {
    const d = p as Pack & { draft?: { kind: string; title: string; body: string; cta: string } };
    if (d.draft) return p;
    if (q.indexOf("theme") !== -1 || q.indexOf("noir") !== -1) {
      d.draft = { kind: "theme", title: "Noir", body: "Contraste alto, menos gris. L1, reversible.", cta: "Aplicar Noir" };
    } else if (q.indexOf("cta") !== -1 || q.indexOf("conver") !== -1 || q.indexOf("boton") !== -1) {
      d.draft = { kind: "cta", title: "CTA único", body: "Todos los botones de esta página dicen Comprar ahora.", cta: "Comprar ahora" };
    } else if (inStudio && (q.indexOf("hero") !== -1 || q.indexOf("hola") !== -1 || q.indexOf("brief") !== -1 || q.indexOf("plan") !== -1)) {
      d.draft = { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" };
    }
    return d;
  }
""",
        1,
    )
    t = t.replace(
        "return finish(input, pick);",
        "return finish(input, injectDraft(pick) as any);",
        1,
    )
    kb.write_text(t, encoding="utf-8")
    print("ok drafts en packs")

op = src / "DigitalBoostOperator.tsx"
o = op.read_text(encoding="utf-8")
if "db-pulse-thread-v1" not in o:
    o = o.replace(
        "const [msgs, setMsgs] = useState<Msg[]>([]);",
        """const THREAD = "db-pulse-thread-" + section;
  const [msgs, setMsgs] = useState<Msg[]>(function () {
    try { return JSON.parse(sessionStorage.getItem(THREAD) || "[]"); } catch { return []; }
  });""",
        1,
    )
    o = o.replace(
        "}, [msgs, out, applied]);",
        """    try { sessionStorage.setItem(THREAD, JSON.stringify(msgs)); } catch {}
  }, [msgs, out, applied]);""",
        1,
    )
    o = o.replace(
        """  useEffect(function () {
    try {
      const seed = localStorage.getItem("db-pulse-seed");
      if (seed) { localStorage.removeItem("db-pulse-seed"); think(seed); }
    } catch {}
  }, []);""",
        """  useEffect(function () {
    try {
      const seed = localStorage.getItem("db-pulse-seed");
      if (seed) { localStorage.removeItem("db-pulse-seed"); think(seed); return; }
    } catch {}
    if (builder && msgs.length === 0) think("hola");
  }, []);""",
        1,
    )
    op.write_text(o, encoding="utf-8")
    print("ok hilo + hola")
else:
    print("operator persist ok")
print("LISTO 4.1")
print("Abrí PULSE en el studio: saluda solo. Hero / theme / CTA = tarjeta Aplicar.")
