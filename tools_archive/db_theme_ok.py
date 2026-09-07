#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
studio = src / "DigitalBoostStoreStudio.tsx"
if not studio.is_file():
    raise SystemExit("Falta DigitalBoostStoreStudio.tsx")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(studio, studio.with_name("DigitalBoostStoreStudio.before_visual_rebuild_" + stamp + ".tsx"))

(src / "DigitalBoostTheme.ts").write_text(r"""
export type StoreTheme = {
  name: string; bg: string; surface: string; text: string; muted: string; primary: string; accent: string;
};
export const PRESETS: StoreTheme[] = [
  { name: "Aura", bg: "#F4F1EA", surface: "#FFFFFF", text: "#101820", muted: "#5C6570", primary: "#101820", accent: "#22D3EE" },
  { name: "Noir", bg: "#0A1020", surface: "#101B32", text: "#F7FAFF", muted: "#AFC0D5", primary: "#8B5CF6", accent: "#22D3EE" },
  { name: "Studio", bg: "#F7FAFF", surface: "#FFFFFF", text: "#0A1020", muted: "#7E90AA", primary: "#3B82F6", accent: "#EC4899" },
  { name: "Ember", bg: "#1A120C", surface: "#2A1C14", text: "#F7FAFF", muted: "#C4B5A0", primary: "#EC4899", accent: "#F59E0B" }
];
const KEY = "db-store-theme-v1";
export function loadTheme(): StoreTheme {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return PRESETS[0];
    const parsed = JSON.parse(raw);
    return parsed && parsed.bg ? parsed : PRESETS[0];
  } catch { return PRESETS[0]; }
}
export function saveTheme(theme: StoreTheme) {
  try { localStorage.setItem(KEY, JSON.stringify(theme)); } catch {}
}
""", encoding="utf-8")
print("ok theme data")

(src / "DigitalBoostThemePanel.tsx").write_text(r"""
import { PRESETS, type StoreTheme } from "./DigitalBoostTheme";
export default function DigitalBoostThemePanel(props: { theme: StoreTheme; onChange: (t: StoreTheme) => void; onClose: () => void }) {
  const fields: Array<keyof StoreTheme> = ["bg", "surface", "text", "muted", "primary", "accent"];
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] p-4 text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Theme System</div>
            <div className="text-sm font-semibold">Tokens de la tienda</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {PRESETS.map(function (p) {
            return (
              <button key={p.name} type="button" onClick={function () { props.onChange(p); }} className={props.theme.name === p.name ? "rounded-xl border border-cyan-400 bg-[#101B32] p-3 text-left" : "rounded-xl border border-white/10 bg-[#101B32] p-3 text-left"}>
                <div className="flex gap-1">
                  {[p.bg, p.primary, p.accent].map(function (c) { return <span key={c} className="h-4 w-4 rounded-full border border-white/20" style={{ background: c }} />; })}
                </div>
                <div className="mt-2 text-xs font-medium">{p.name}</div>
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {fields.map(function (k) {
            return (
              <label key={k} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#101B32] px-3 py-2">
                <span className="text-[11px] uppercase tracking-[0.12em] text-[#AFC0D5]">{k}</span>
                <input type="color" value={props.theme[k]} onChange={function (e) { const n: StoreTheme = Object.assign({}, props.theme, { name: "Custom" }); n[k] = e.target.value; props.onChange(n); }} className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent" />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok theme panel")

t = studio.read_text(encoding="utf-8")
if "DigitalBoostTheme" not in t:
    t = t.replace(
        'from "./DigitalBoostStoreCanvas";',
        'from "./DigitalBoostStoreCanvas";\nimport { loadTheme, saveTheme, PRESETS, type StoreTheme } from "./DigitalBoostTheme";\nimport DigitalBoostThemePanel from "./DigitalBoostThemePanel.tsx";',
        1,
    )
if "const [theme, setTheme]" not in t:
    t = t.replace(
        "const [saved, setSaved] = useState(false);",
        "const [saved, setSaved] = useState(false);\n  const [theme, setTheme] = useState<StoreTheme>(() => PRESETS[0]);\n  const [showTheme, setShowTheme] = useState(false);",
        1,
    )
if "setTheme(loadTheme())" not in t:
    t = t.replace("setBlocks(loadCanvas());", "setBlocks(loadCanvas()); setTheme(loadTheme());", 1)
if "saveTheme(theme)" not in t and "saveCanvas(blocks)" in t:
    t = t.replace(
        "useEffect(() => { if (ready) saveCanvas(blocks); }, [blocks, ready]);",
        "useEffect(() => { if (ready) saveCanvas(blocks); }, [blocks, ready]);\n  useEffect(() => { if (ready) saveTheme(theme); }, [theme, ready]);",
        1,
    )
if "setShowTheme(true)" not in t:
    t = t.replace(
        '{catalog.map((type) => (',
        '<button type="button" onClick={() => setShowTheme(true)} className="shrink-0 rounded-full border border-cyan-400/40 px-3 py-2 text-xs text-cyan-300">Theme</button>\n            {catalog.map((type) => (',
        1,
    )
if "showTheme &&" not in t:
    t = t.replace(
        '<div className="flex h-full min-h-0 flex-col bg-[#070d18] text-[#F7FAFF]">',
        '<div className="flex h-full min-h-0 flex-col bg-[#070d18] text-[#F7FAFF]">\n      {showTheme && <DigitalBoostThemePanel theme={theme} onChange={setTheme} onClose={() => setShowTheme(false)} />}',
        1,
    )
studio.write_text(t, encoding="utf-8")
print("ok studio")
print("LISTO THEME")
print("Store Builder -> chip Theme")
