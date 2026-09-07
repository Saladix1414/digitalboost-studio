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

(src / "DigitalBoostHistory.ts").write_text(r"""
export type Snapshot = {
  id: string; at: number; label: string; source: "user" | "publish"; blocks: any[]; theme?: any;
};
const KEY = "db-store-history-v1";
export function loadHistory(): Snapshot[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
export function saveHistory(list: Snapshot[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30))); } catch {}
}
export function pushSnapshot(partial: Omit<Snapshot, "id" | "at">): Snapshot[] {
  const next: Snapshot = { id: "v-" + Date.now().toString(36), at: Date.now(), ...partial };
  const list = [next].concat(loadHistory()).slice(0, 30);
  saveHistory(list);
  return list;
}
export function formatWhen(at: number) {
  try { return new Date(at).toLocaleString("es-AR"); } catch { return String(at); }
}
""", encoding="utf-8")
print("ok history data")

(src / "DigitalBoostHistoryPanel.tsx").write_text(r"""
import { formatWhen, type Snapshot } from "./DigitalBoostHistory";
export default function DigitalBoostHistoryPanel(props: {
  items: Snapshot[]; currentCount: number; onRestore: (s: Snapshot) => void; onClose: () => void;
}) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] p-4 text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Version History</div>
            <div className="text-sm font-semibold">Restaurar un punto</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        {!props.items.length && <p className="text-xs text-[#AFC0D5]">Publica o guarda una version.</p>}
        <div className="space-y-2">
          {props.items.map(function (s) {
            const diff = (s.blocks && s.blocks.length ? s.blocks.length : 0) - props.currentCount;
            const cmp = diff === 0 ? "mismo largo" : (diff > 0 ? "+" + diff + " bloques" : diff + " bloques");
            return (
              <div key={s.id} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-cyan-300">{s.source}</div>
                <div className="mt-1 text-sm font-medium">{s.label}</div>
                <div className="mt-1 text-[11px] text-[#AFC0D5]">{formatWhen(s.at)} · {(s.blocks && s.blocks.length) || 0} bloques · {cmp}</div>
                <button type="button" onClick={function () { props.onRestore(s); }} className="mt-2 h-11 rounded-md bg-emerald-400 px-3 text-xs font-semibold text-[#070D18]">Restore</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok history panel")

t = studio.read_text(encoding="utf-8")
if "DigitalBoostHistory" not in t:
    t = t.replace(
        'from "./DigitalBoostStoreCanvas";',
        'from "./DigitalBoostStoreCanvas";\nimport { loadHistory, pushSnapshot, type Snapshot } from "./DigitalBoostHistory";\nimport DigitalBoostHistoryPanel from "./DigitalBoostHistoryPanel.tsx";',
        1,
    )
if "const [history, setHistory]" not in t:
    t = t.replace(
        "const [saved, setSaved] = useState(false);",
        "const [saved, setSaved] = useState(false);\n  const [history, setHistory] = useState<Snapshot[]>([]);\n  const [showHistory, setShowHistory] = useState(false);",
        1,
    )
if "setHistory(loadHistory())" not in t:
    t = t.replace("setBlocks(loadCanvas());", "setBlocks(loadCanvas()); setHistory(loadHistory());", 1)
if 'source: "publish"' not in t:
    t = t.replace(
        "function publish() {\n    saveCanvas(blocks);\n    setSaved(true);",
        "function publish() {\n    saveCanvas(blocks);\n    setHistory(pushSnapshot({ label: \"Publicado · \" + page, source: \"publish\", blocks: blocks }));\n    setSaved(true);",
        1,
    )
if "setShowHistory(true)" not in t:
    t = t.replace(
        '{catalog.map((type) => (',
        '<button type="button" onClick={() => setShowHistory(true)} className="shrink-0 rounded-full border border-emerald-400/40 px-3 py-2 text-xs text-emerald-300">History</button>\n            {catalog.map((type) => (',
        1,
    )
if "showHistory &&" not in t:
    t = t.replace(
        '<div className="flex h-full min-h-0 flex-col bg-[#070d18] text-[#F7FAFF]">',
        '<div className="flex h-full min-h-0 flex-col bg-[#070d18] text-[#F7FAFF]">\n      {showHistory && <DigitalBoostHistoryPanel items={history} currentCount={blocks.length} onRestore={(s) => { setBlocks(s.blocks || []); setHistory(pushSnapshot({ label: \"Restore · \" + s.label, source: \"user\", blocks: s.blocks || [] })); setShowHistory(false); }} onClose={() => setShowHistory(false)} />}',
        1,
    )
studio.write_text(t, encoding="utf-8")
print("ok studio")
print("LISTO HISTORY")
print("Publicar guarda version. Chip History restaura.")
