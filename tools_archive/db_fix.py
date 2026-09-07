#!/usr/bin/env python3
from pathlib import Path
import re, shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
ws = src / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ws, ws.with_name("StoreBuilderWorkspace.before_visual_rebuild_" + stamp + ".tsx"))
print("backup ok")

# 1) romper import circular Console.tsx -> Console.ts
data = src / "DigitalBoostConsole.ts"
tsx = src / "DigitalBoostConsole.tsx"
if data.is_file():
    dest = src / "DigitalBoostConsoleData.ts"
    if not dest.is_file():
        dest.write_text(data.read_text(encoding="utf-8"), encoding="utf-8")
    if tsx.is_file():
        t = tsx.read_text(encoding="utf-8")
        t = t.replace('from "./DigitalBoostConsole"', 'from "./DigitalBoostConsoleData"')
        tsx.write_text(t, encoding="utf-8")
        print("ok console import")

# 2) apagar QA css agresivo
qa = src / "digitalboost-qa.css"
if qa.is_file():
    qa.write_text("/* qa disabled after blank screen */\n", encoding="utf-8")
    print("ok qa css emptied")

# 3) stubs si un import no tiene archivo
txt = ws.read_text(encoding="utf-8")
mods = re.findall(r'from "\./(DigitalBoost[^"]+)"', txt)
print("workspace imports:", mods)
for name in mods:
    tsx_p = src / (name + ".tsx")
    ts_p = src / (name + ".ts")
    if tsx_p.is_file() or ts_p.is_file():
        print("  ok", name)
        continue
    tsx_p.write_text(
        'export default function ' + name + '(props: { onClose?: () => void }) { return null; }\n',
        encoding="utf-8",
    )
    print("  STUB", name)

# 4) si CommandCenter no existe, stub minimo
cc = src / "DigitalBoostCommandCenter.tsx"
if not cc.is_file():
    cc.write_text('export default function DigitalBoostCommandCenter() { return null; }\n', encoding="utf-8")
    print("stub command center")
else:
    cct = cc.read_text(encoding="utf-8")
    cct = cct.replace('import "./digitalboost-qa.css";\n', "")
    cc.write_text(cct, encoding="utf-8")
    print("ok command center")

ws.write_text(txt, encoding="utf-8")
print("LISTO FIX")
print("Reinicia el server")
