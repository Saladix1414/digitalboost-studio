#!/usr/bin/env python3
from pathlib import Path
import re
src = Path("src")
app = src / "DigitalBoostPulseApply.ts"
if not app.is_file():
    raise SystemExit("cd digitalboost-studio")
a = app.read_text(encoding="utf-8")
if "export function moveBlock" not in a:
    extra = [
"",
"function commit(next: any[]) {",
"  const bag = readBlocks();",
"  try { localStorage.setItem(bag.key, JSON.stringify(next)); localStorage.setItem('db-store-canvas-v1', JSON.stringify(next)); } catch {}",
"  live(next);",
"  window.dispatchEvent(new CustomEvent('db-canvas-reload', { detail: next }));",
"}",
"export function moveBlock(index: number, dir: number) {",
"  snapHistory();",
"  const blocks = readBlocks().blocks.slice();",
"  const j = index + dir;",
"  if (j < 0 || j >= blocks.length) return index;",
"  const t = blocks[index]; blocks[index] = blocks[j]; blocks[j] = t;",
"  commit(blocks);",
"  return j;",
"}",
"export function duplicateBlock(index: number) {",
"  snapHistory();",
"  const blocks = readBlocks().blocks.slice();",
"  const copy = Object.assign({}, blocks[index], { id: 'db-' + Date.now() });",
"  blocks.splice(index + 1, 0, copy);",
"  commit(blocks);",
"  return index + 1;",
"}",
"export function removeBlock(index: number) {",
"  snapHistory();",
"  const blocks = readBlocks().blocks.slice();",
"  if (blocks.length < 2) return index;",
"  blocks.splice(index, 1);",
"  commit(blocks);",
"  return Math.max(0, index - 1);",
"}",
]
    if "function snapHistory" not in a:
        print("WARN falta snapHistory")
    else:
        app.write_text(a.rstrip() + "\n" + "\n".join(extra) + "\n", encoding="utf-8")
        print("ok layer fn")
else:
    print("ya layer fn")

dock = src / "DigitalBoostStudioDock.tsx"
d = dock.read_text(encoding="utf-8")
d, n = re.subn(
    r'import \{[^}]*\} from ["\']\./DigitalBoostPulseApply["\'];',
    "import { applyPulseDraft, appendPulseBlock, undoPulseApply, applyBlockAt, moveBlock, duplicateBlock, removeBlock } from './DigitalBoostPulseApply';",
    d,
    count=1,
)
print("import", n)
btns = (
    '<div className="mt-2 grid grid-cols-4 gap-1">'
    '<button type="button" className="h-10 rounded-lg border border-white/10 text-[10px]" onClick={function () { setSel(moveBlock(sel, -1)); }}>Subir</button>'
    '<button type="button" className="h-10 rounded-lg border border-white/10 text-[10px]" onClick={function () { setSel(moveBlock(sel, 1)); }}>Bajar</button>'
    '<button type="button" className="h-10 rounded-lg border border-white/10 text-[10px]" onClick={function () { setSel(duplicateBlock(sel)); }}>Dup</button>'
    '<button type="button" className="h-10 rounded-lg border border-amber-400/30 text-[10px] text-amber-200" onClick={function () { setSel(removeBlock(sel)); }}>Borrar</button>'
    "</div>"
)
if "moveBlock(sel" not in d:
    needle = '<p className="text-[11px] text-[#AFC0D5]">L1 · History / Export · Deshacer</p>'
    if needle in d:
        d = d.replace(needle, btns + needle, 1)
        print("ok btns")
    else:
        print("no match footer insp")
else:
    print("ya btns")
dock.write_text(d, encoding="utf-8")
print("LISTO LAYER")
