#!/usr/bin/env python3
from pathlib import Path
import re
p = Path("src/DigitalBoostStudioDock.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
d = p.read_text(encoding="utf-8")
d2, n = re.subn(
    r'import \{[^}]*\} from ["\']\./DigitalBoostPulseApply["\'];',
    "import { applyPulseDraft, appendPulseBlock, undoPulseApply } from './DigitalBoostPulseApply';",
    d,
    count=1,
)
if n:
    d = d2
    print("ok import")
else:
    if "DigitalBoostPulseApply" not in d:
        d = "import { applyPulseDraft, appendPulseBlock, undoPulseApply } from './DigitalBoostPulseApply';\n" + d
        print("ok import top")
    else:
        print("import raro")

if "undoPulseApply()" not in d:
    old = '{tab === "export" && ('
    if old in d:
        d = d.replace(
            old,
            '{tab === "export" && (<div className="space-y-2"><button type="button" className="h-11 w-full rounded-lg border border-white/10" onClick={function () { try { navigator.clipboard.writeText(localStorage.getItem("db-store-canvas-v1:" + facts.page) || localStorage.getItem("db-store-canvas-v1") || "[]"); } catch {} }}>Copiar JSON</button><button type="button" className="h-11 w-full rounded-lg border border-white/10" onClick={function () { undoPulseApply(); }}>Deshacer ultimo apply</button></div> || (',
            1,
        )
        # that || ( is WRONG - don't do that
print("stop bad")
