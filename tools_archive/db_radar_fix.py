#!/usr/bin/env python3
from pathlib import Path
import re

ws = Path("src/StoreBuilderWorkspace.tsx")
w = ws.read_text(encoding="utf-8")

w = w.replace(
    'from "./DigitalBoostOsLive";\nimport DigitalBoostPulseRadar from "./DigitalBoostPulseRadar.tsx;',
    'from "./DigitalBoostOsLive.tsx";\nimport DigitalBoostPulseRadar from "./DigitalBoostPulseRadar.tsx";',
)
w = w.replace(
    'from "./DigitalBoostOsLive";\nimport DigitalBoostPulseRadar from "./DigitalBoostPulseRadar.tsx',
    'from "./DigitalBoostOsLive.tsx";\nimport DigitalBoostPulseRadar from "./DigitalBoostPulseRadar.tsx";',
)

# useEffect in react import
if "useEffect" not in w.split("from \"react\"")[0][-200:]:
    w = re.sub(
        r'import \{([^}]+)\} from "react";',
        lambda m: 'import { useEffect, ' + m.group(1).strip() + ' } from "react";' if "useEffect" not in m.group(1) else m.group(0),
        w,
        count=1,
    )
    print("ok useEffect import")

# drop radar from header if JSX sibling blew up — remount inside a span
if "<DigitalBoostOsLive /><DigitalBoostPulseRadar />" in w:
    w = w.replace(
        "<DigitalBoostOsLive /><DigitalBoostPulseRadar />",
        "<span className=\"inline-flex items-center\"><DigitalBoostOsLive /><DigitalBoostPulseRadar /></span>",
        1,
    )
    print("ok wrap")

ws.write_text(w, encoding="utf-8")
print("LISTO RADAR FIX")
