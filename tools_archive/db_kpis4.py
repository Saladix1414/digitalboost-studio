#!/usr/bin/env python3
from pathlib import Path

ws = Path("src/StoreBuilderWorkspace.tsx")
rng = Path("src/DigitalBoostOsRange.tsx")
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")

w = ws.read_text(encoding="utf-8")
w = w.replace("<DigitalBoostOsKpiPaint /><CommerceOSOverview", "<CommerceOSOverview")
w = w.replace("<DigitalBoostOsKpiPaint />\n            <CommerceOSOverview", "<CommerceOSOverview")
ws.write_text(w, encoding="utf-8")
print("ok workspace unstuck")

if rng.is_file():
    t = rng.read_text(encoding="utf-8")
    if "DigitalBoostOsKpiPaint" not in t:
        t = t.replace(
            'import { useEffect, useState } from "react";',
            'import { useEffect, useState } from "react";\nimport DigitalBoostOsKpiPaint from "./DigitalBoostOsKpiPaint.tsx";',
            1,
        )
        t = t.replace(
            "return (\n    <div className=\"flex items-center gap-1\">",
            "return (\n    <>\n    <DigitalBoostOsKpiPaint />\n    <div className=\"flex items-center gap-1\">",
            1,
        )
        if t.rstrip().endswith("}") and "</div>\n  );" in t:
            t = t.replace(
                "    </div>\n  );\n}",
                "    </div>\n    </>\n  );\n}",
                1,
            )
        rng.write_text(t, encoding="utf-8")
        print("ok painter in range")
print("LISTO KPIS4")
