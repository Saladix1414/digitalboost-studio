#!/usr/bin/env python3
from pathlib import Path
import re
src = Path("src")
app = src / "DigitalBoostPulseApply.ts"
a = app.read_text(encoding="utf-8")
if "export function toggleHidden" not in a:
    if "function commit(" not in a:
        print("WARN corre db_layer.py primero")
    else:
        a = a.rstrip() + "\n\nexport function toggleHidden(index: number) {\n  snapHistory();\n  const blocks = readBlocks().blocks.slice();\n  const cur = blocks[index] || {};\n  blocks[index] = Object.assign({}, cur, { hidden: !cur.hidden });\n  commit(blocks);\n  return index;\n}\n"
        app.write_text(a, encoding="utf-8")
        print("ok toggleHidden")
else:
    print("ya hidden")

dock = src / "DigitalBoostStudioDock.tsx"
d = dock.read_text(encoding="utf-8")
d, n = re.subn(
    r'import \{[^}]*\} from ["\']\./DigitalBoostPulseApply["\'];',
    "import { applyPulseDraft, appendPulseBlock, undoPulseApply, applyBlockAt, moveBlock, duplicateBlock, removeBlock, toggleHidden } from './DigitalBoostPulseApply';",
    d,
    count=1,
)
print("import", n)
if "sel === i" not in d:
    d = d.replace(
        '(mute ? "border-amber-400/30" : "border-white/10")',
        '((sel === i ? "border-cyan-400 bg-cyan-400/10 " : "") + (mute ? "border-amber-400/30" : "border-white/10"))',
        1,
    )
    print("ok highlight")
else:
    print("ya highlight")
if "toggleHidden" not in d.split("import")[-1][:20] and "toggleHidden(sel)" not in d:
    d = d.replace(
        ">Dup</button>",
        '>Dup</button><button type="button" className="h-10 rounded-lg border border-white/10 text-[10px]" onClick={function () { toggleHidden(sel); }}>Ojo</button>',
        1,
    )
    # grid-cols-4 -> 5 if we added a button - optional
    d = d.replace("grid-cols-4 gap-1", "grid-cols-5 gap-1", 1)
    print("ok ojo")
dock.write_text(d, encoding="utf-8")
print("LISTO VIS")
