#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
studio = root / "src" / "DigitalBoostStoreStudio.tsx"
if not studio.is_file():
    raise SystemExit("Falta DigitalBoostStoreStudio.tsx — corre db_fase810.py antes")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
b = studio.with_name("DigitalBoostStoreStudio.before_visual_rebuild_" + stamp + ".tsx")
shutil.copy2(studio, b)
print("backup", b.name)

(root / "src" / "DigitalBoostTheme.ts").write_text("""
export type StoreTheme = {
  name: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
};
export const PRESETS: StoreTheme[] = [
  { name: "Aura", bg: "#F4F1EA", surface: "#FFFFFF", text: "#101820", muted: "#5C6570", primary: "#101820", accent: "#22D3EE" },
  { name: "Noir", bg: "#0A1020", surface: "#101B32", text: "#F7FAFF", muted: "#AFC0D5", primary: "#8B5CF6", accent: "#22D3EE" },
  { name: "Studio", bg: "#F7FAFF", surface: "#FFFFFF", text: "#0A1020", muted: "#7E90AA", primary: "#3B82F6", accent: "#EC4899" },
  { name: "Ember", bg: "#1A120C", surface: "#2A1C14", text: "#F7FAFF", muted: "#C4B5A0", primary: "#EC4899", accent: "#F59E0B" },
];
const KEY = "db-store-theme-v1";
export function loadTheme(): StoreTheme {
  if (typeof localStorage === "undefined") return PRESETS[0];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return PRESETS[0];
    const parsed = JSON.parse(raw) as StoreTheme;
    if (!parsed || !parsed.bg) return PRESETS[0];
    return parsed;
  } catch { return PRESETS[0]; }
}
export function saveTheme(theme: StoreTheme) {
  try { localStorage.setItem(KEY, JSON.stringify(theme)); } catch {}
}
""", encoding="utf-8")
print("ok theme ts")

(root / "src" / "DigitalBoostThemePanel.tsx").write_text("""
import { PRESETS, type StoreTheme } from "./DigitalBoostTheme";

export default function DigitalBoostThemePanel({ theme, onChange, onClose }: {
  theme: StoreTheme; onChange: (t: StoreTheme) => void; onClose: () => void;
}) {
  const fields: Array<keyof StoreTheme> = ["bg", "surface", "text", "muted", "primary", "accent"];
  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={onClose}>
      <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] p-4 text-[#F7FAFF]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Theme System</div>
            <div className="text-sm font-semibold">Tokens de la tienda</div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button key={p.name} type="button" onClick={() => onChange(p)} className={"rounded-xl border p-3 text-left " + (theme.name === p.name ? "border-cyan-400 bg-[#101B32]" : "border-white/10 bg-[#101B32]") }>
              <div className="flex gap-1">
                {[p.bg, p.primary, p.accent].map((c) => <span key={c} className="h-4 w-4 rounded-full border border-white/20" style={{ background: c }} />)}
              </div>
              <div className="mt-2 text-xs font-medium">{p.name}</div>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {fields.map((k) => (
            <label key={k} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#101B32] px-3 py-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-[#AFC0D5]">{k}</span>
              <input type="color" value={theme[k]} onChange={(e) => onChange({ ...theme, name: "Custom", [k]: e.target.value })} className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok panel")

txt = studio.read_text(encoding="utf-8")
if "DigitalBoostTheme" not in txt:
    txt = txt.replace(
        'from "./DigitalBoostStoreCanvas";',
        'from "./DigitalBoostStoreCanvas";\nimport { loadTheme, saveTheme, PRESETS, type StoreTheme } from "./DigitalBoostTheme";\nimport DigitalBoostThemePanel from "./DigitalBoostThemePanel";',
        1,
    )
if "const [theme, setTheme]" not in txt:
    txt = txt.replace(
        "const [saved, setSaved] = useState(false);",
        "const [saved, setSaved] = useState(false);\n  const [theme, setTheme] = useState<StoreTheme>(() => PRESETS[0]);\n  const [showTheme, setShowTheme] = useState(false);",
        1,
    )
if "setTheme(loadTheme())" not in txt:
    txt = txt.replace(
        "setBlocks(loadCanvas()); setReady(true);",
        "setBlocks(loadCanvas()); setTheme(loadTheme()); setReady(true);",
        1,
    )
if "saveTheme(theme)" not in txt:
    txt = txt.replace(
        "useEffect(() => { if (ready) saveCanvas(blocks); }, [blocks, ready]);",
        "useEffect(() => { if (ready) saveCanvas(blocks); }, [blocks, ready]);\n  useEffect(() => { if (ready) saveTheme(theme); }, [theme, ready]);",
        1,
    )
txt = txt.replace("bg-[#F4F1EA] text-[#101820]", "db-store-paper")
txt = txt.replace("bg-[#F4F1EA]", "bg-[color:var(--store-surface,#F4F1EA)]")
if "setShowTheme(true)" not in txt:
    txt = txt.replace(
        'className="ml-1 hidden h-10 items-center gap-1 rounded-md border border-white/10 px-3 text-xs text-slate-400 sm:inline-flex"',
        'className="ml-1 hidden h-10 items-center gap-1 rounded-md border border-white/10 px-3 text-xs text-slate-400 sm:inline-flex"',
        1,
    )
    txt = txt.replace(
        '<button type="button" onClick={() => setPreview((v) => !v)}',
        '<button type="button" onClick={() => setShowTheme(true)} className="hidden h-10 items-center rounded-md border border-white/10 px-3 text-xs text-slate-400 sm:inline-flex">Theme</button>\n          <button type="button" onClick={() => setPreview((v) => !v)}',
        1,
    )
    txt = txt.replace(
        '{catalog.map((type) => (\n              <button key={type} type="button" onClick={() => add(type)} className="shrink-0 rounded-full border border-white/10 bg-[#101B32] px-3 py-2 text-xs">+ {BLOCK_META[type].label}</button>\n            ))}',
        '{catalog.map((type) => (\n              <button key={type} type="button" onClick={() => add(type)} className="shrink-0 rounded-full border border-white/10 bg-[#101B32] px-3 py-2 text-xs">+ {BLOCK_META[type].label}</button>\n            ))}\n            <button type="button" onClick={() => setShowTheme(true)} className="shrink-0 rounded-full border border-cyan-400/40 px-3 py-2 text-xs text-cyan-300">Theme</button>',
        1,
    )
if "showTheme &&" not in txt:
    txt = txt.replace(
        "return (\n    <div className=\"flex h-full min-h-0 flex-col bg-[#070d18] text-[#F7FAFF]\">",
        "const paper = { ['--store-bg' as string]: theme.bg, ['--store-surface' as string]: theme.surface, ['--store-text' as string]: theme.text, ['--store-muted' as string]: theme.muted, ['--store-primary' as string]: theme.primary, ['--store-accent' as string]: theme.accent } as React.CSSProperties;\n  return (\n    <div className=\"flex h-full min-h-0 flex-col bg-[#070d18] text-[#F7FAFF]\">\n      {showTheme && <DigitalBoostThemePanel theme={theme} onChange={setTheme} onClose={() => setShowTheme(false)} />}",
        1,
    )
if "--store-bg" in txt and "style={paper}" not in txt:
    txt = txt.replace(
        'className={cx("mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl"',
        'style={paper} className={cx("mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl"',
        1,
    )

css = root / "src" / "digitalboost-os.css"
extra = """
.db-store-paper{background:var(--store-bg,#F4F1EA)!important;color:var(--store-text,#101820)!important}
.db-store-paper .bg-\\[\\#101820\\],
.db-store-paper [class*="bg-[#101820"]{background:var(--store-primary,#101820)!important}
"""
if css.is_file():
    cur = css.read_text(encoding="utf-8")
    if ".db-store-paper" not in cur:
        css.write_text(cur + extra, encoding="utf-8")
else:
    css.write_text(extra, encoding="utf-8")
if 'import "./digitalboost-os.css"' not in txt and "digitalboost-os.css" not in txt:
    txt = "import \"./digitalboost-os.css\";\n" + txt

studio.write_text(txt, encoding="utf-8")
print("ok studio")
print("LISTO THEME")
print("Boton Theme en chips (mobile) y top bar (desktop)")
