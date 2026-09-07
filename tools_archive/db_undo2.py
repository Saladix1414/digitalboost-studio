#!/usr/bin/env python3
from pathlib import Path
import re
p = Path("src/DigitalBoostStudioDock.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
d = p.read_text(encoding="utf-8")
d, n = re.subn(
    r'import \{[^}]*\} from ["\']\./DigitalBoostPulseApply["\'];',
    "import { applyPulseDraft, appendPulseBlock, undoPulseApply } from './DigitalBoostPulseApply';",
    d,
    count=1,
)
print("import", n)
if "undoPulseApply()" in d:
    p.write_text(d, encoding="utf-8")
    print("ya undo")
    raise SystemExit(0)
start = d.find('{tab === "export"')
if start < 0:
    p.write_text(d, encoding="utf-8")
    print("no export tab")
    raise SystemExit(0)
end = d.find(")}", start)
if end < 0:
    raise SystemExit("no cierre export")
block = '{tab === "export" && (<div className="space-y-2"><button type="button" className="h-11 w-full rounded-lg border border-white/10" onClick={function () { try { navigator.clipboard.writeText(localStorage.getItem("db-store-canvas-v1:" + facts.page) || "[]"); } catch {} }}>Copiar JSON</button><button type="button" className="h-11 w-full rounded-lg border border-white/10" onClick={function () { undoPulseApply(); }}>Deshacer ultimo apply</button></div>'
d = d[:start] + block + d[end:]
p.write_text(d, encoding="utf-8")
print("LISTO UNDO")
