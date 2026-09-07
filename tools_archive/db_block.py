#!/usr/bin/env python3
from pathlib import Path
import re
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

app = src / "DigitalBoostPulseApply.ts"
a = app.read_text(encoding="utf-8") if app.is_file() else ""
if "export function applyBlockAt" not in a:
    extra = [
"",
"export function applyBlockAt(index: number, patch: { title?: string; body?: string; cta?: string }) {",
"  snapHistory();",
"  const bag = readBlocks();",
"  const next = bag.blocks.map(function (b: any, i: number) {",
"    if (i !== index) return b;",
"    return Object.assign({}, b, patch);",
"  });",
"  try { localStorage.setItem(bag.key, JSON.stringify(next)); localStorage.setItem('db-store-canvas-v1', JSON.stringify(next)); } catch {}",
"  live(next);",
"  window.dispatchEvent(new CustomEvent('db-canvas-reload', { detail: next }));",
"  return true;",
"}",
]
    if "function snapHistory" not in a or "function live(" not in a:
        print("WARN apply incompleto — corre db_apply_w.py primero")
    else:
        app.write_text(a.rstrip() + "\n" + "\n".join(extra) + "\n", encoding="utf-8")
        print("ok applyBlockAt")
else:
    print("ya applyBlockAt")

dock = src / "DigitalBoostStudioDock.tsx"
d = dock.read_text(encoding="utf-8")
d, n = re.subn(
    r'import \{[^}]*\} from ["\']\./DigitalBoostPulseApply["\'];',
    "import { applyPulseDraft, appendPulseBlock, undoPulseApply, applyBlockAt } from './DigitalBoostPulseApply';",
    d,
    count=1,
)
print("import", n)
old = 'applyPulseDraft({ kind: "hero", title: title, body: body, cta: cta });'
new = 'applyBlockAt(sel, { title: title, body: body, cta: cta });'
if old in d:
    d = d.replace(old, new, 1)
    print("ok bind apply")
elif "applyBlockAt(sel" in d:
    print("ya bind")
else:
    print("no match apply click")
dock.write_text(d, encoding="utf-8")
print("LISTO BLOCK")
