#!/usr/bin/env python3
from pathlib import Path
import re, shutil, subprocess
from datetime import datetime

root = Path.cwd()
src = root / "src"
ws = src / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")

def bal(text):
    return text.count("{") - text.count("}"), text.count("(") - text.count(")")

def ok_tsx(p: Path):
    if not p.is_file():
        return False
    b, par = bal(p.read_text(encoding="utf-8"))
    return abs(b) <= 1 and abs(par) <= 2

# 1) error visible en el browser
idxp = root / "index.html"
if idxp.is_file():
    idx = idxp.read_text(encoding="utf-8")
    if "z-index:99999" not in idx:
        boot = """
<script>
window.addEventListener("error", function (e) {
  var el = document.createElement("pre");
  el.style.cssText = "position:fixed;inset:0;z-index:99999;background:#0A1020;color:#fb7185;padding:24px;white-space:pre-wrap;font:14px/1.5 monospace";
  el.textContent = (e.message || "error") + "\\n" + (e.filename || "") + ":" + (e.lineno || "");
  document.body.appendChild(el);
});
window.addEventListener("unhandledrejection", function (e) {
  var el = document.createElement("pre");
  el.style.cssText = "position:fixed;inset:0;z-index:99999;background:#0A1020;color:#fb7185;padding:24px;white-space:pre-wrap;font:14px/1.5 monospace";
  el.textContent = String(e.reason || e);
  document.body.appendChild(el);
});
</script>
"""
        idx = idx.replace("</head>", boot + "\n</head>")
        idxp.write_text(idx, encoding="utf-8")
        print("ok error overlay")

# 2) apagar css extra
for name in ["digitalboost-qa.css", "commerce-os-navy-lock.css"]:
    p = src / name
    if p.is_file():
        p.write_text("/* disabled during crash recovery */\n", encoding="utf-8")
        print("disabled", name)

# 3) restaurar workspace si esta desbalanceado
backups = sorted(src.glob("StoreBuilderWorkspace.before_*.tsx"))
print("backups workspace:", len(backups))
if not ok_tsx(ws) and backups:
    for p in reversed(backups):
        if ok_tsx(p):
            shutil.copy2(p, ws)
            print("restored workspace from", p.name)
            break
else:
    print("workspace balance", bal(ws.read_text(encoding="utf-8")))

# 4) restaurar studio si esta roto
st = src / "DigitalBoostStoreStudio.tsx"
st_backs = sorted(src.glob("DigitalBoostStoreStudio.before_*.tsx"))
if st.is_file() and not ok_tsx(st) and st_backs:
    for p in reversed(st_backs):
        if ok_tsx(p):
            shutil.copy2(p, st)
            print("restored studio from", p.name)
            break
elif st.is_file():
    print("studio balance", bal(st.read_text(encoding="utf-8")))

# 5) stubs de overlays para que el import no tumbe el boot
STUB = "export default function Stub(props: any) { return null; }\n"
overlay = [
    "DigitalBoostCommandCenter",
    "DigitalBoostOperator",
    "DigitalBoostHealth",
    "DigitalBoostIntegrations",
    "DigitalBoostAutomations",
    "DigitalBoostConsole",
    "DigitalBoostNotifications",
    "DigitalBoostShortcuts",
    "DigitalBoostThemePanel",
    "DigitalBoostHistoryPanel",
]
for name in overlay:
    p = src / (name + ".tsx")
    if p.is_file() and not ok_tsx(p):
        p.write_text(STUB, encoding="utf-8")
        print("stubbed broken", name)
    elif not p.is_file():
        p.write_text(STUB, encoding="utf-8")
        print("stubbed missing", name)

# 6) console circular
tsx = src / "DigitalBoostConsole.tsx"
if tsx.is_file() and "from \"./DigitalBoostConsole\"" in tsx.read_text(encoding="utf-8"):
    t = tsx.read_text(encoding="utf-8")
    t = t.replace('from "./DigitalBoostConsole"', 'from "./DigitalBoostConsoleData"')
    tsx.write_text(t, encoding="utf-8")
    srcp = src / "DigitalBoostConsole.ts"
    dest = src / "DigitalBoostConsoleData.ts"
    if srcp.is_file() and not dest.is_file():
        dest.write_text(srcp.read_text(encoding="utf-8"), encoding="utf-8")
    print("ok console cycle")

# 7) comentar imports de overlays si el JSX los usa pero el default rompe
wst = ws.read_text(encoding="utf-8")
for name in overlay:
    if ("from \"./" + name + "\"") in wst and not (src / (name + ".tsx")).is_file() and not (src / (name + ".ts")).is_file():
        wst = wst.replace('import ' + name + ' from "./' + name + '";', 'const ' + name + ' = (props: any) => null;')
ws.write_text(wst, encoding="utf-8")

print("---- build ----")
r = subprocess.run(["npm", "run", "build"], cwd=root, capture_output=True, text=True)
out = (r.stdout or "") + "\n" + (r.stderr or "")
tail = "\n".join(out.splitlines()[-60:])
print(tail)
(root / "_fix2_build.log").write_text(out, encoding="utf-8")
print("LISTO FIX2")
print("exit", r.returncode)
