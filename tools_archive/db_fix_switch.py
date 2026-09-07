#!/usr/bin/env python3
from pathlib import Path

ws = Path("src/StoreBuilderWorkspace.tsx")
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
t = ws.read_text(encoding="utf-8")
broken = 'DigitalBoost Commerce OS</span> <DigitalBoostStoreSwitch /><span className="hidden">'
fixed = 'DigitalBoost Commerce OS\n                <DigitalBoostStoreSwitch />'
if broken in t:
    t = t.replace(broken, fixed, 1)
    print("ok repaired header")
else:
    t = t.replace(
        "DigitalBoost Commerce OS</span> <DigitalBoostStoreSwitch /><span className=\"hidden\">",
        "DigitalBoost Commerce OS\n                <DigitalBoostStoreSwitch />",
        1,
    )
    if "DigitalBoost Commerce OS</span>" in t:
        print("WARN sigue el span roto")
    else:
        print("ok repaired alt")
if "DigitalBoostStoreSwitch from" not in t and 'from "./DigitalBoostStoreSwitch.tsx"' not in t:
    t = t.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostStoreSwitch from "./DigitalBoostStoreSwitch.tsx";',
        1,
    )
ws.write_text(t, encoding="utf-8")
print("LISTO FIX SWITCH")
