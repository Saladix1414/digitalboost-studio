#!/usr/bin/env python3
from pathlib import Path
import re

ov = Path("src/CommerceOSOverview.tsx")
t = ov.read_text(encoding="utf-8")
print("ANTES 474:")
for m in re.finditer(r".{0,50}474.{0,50}", t):
    print(" ", m.group(0).replace("\n", " "))

if "const osRange = useOsRange()" not in t:
    t = t.replace(
        "export default function CommerceOSOverview",
        "export default function CommerceOSOverview",
        1,
    )
    t = re.sub(
        r"(export default function CommerceOSOverview\s*\([^)]*\)\s*\{)",
        r"\1\n  const osRange = useOsRange();\n  const osMul = rangeMul(osRange);\n",
        t,
        count=1,
    )
    print("ok hook")
else:
    print("hook ya estaba")

t = t.replace("money(474)", "money(Math.round(474 * osMul))")
t = t.replace("money(118)", "money(Math.round(118 * osMul))")
# value fields
t = re.sub(r"value:\s*money\(474\)", "value: money(Math.round(474 * osMul))", t)
t = re.sub(r"value:\s*[\"']US\\$ 474[\"']", "value: money(Math.round(474 * osMul))", t)

ov.write_text(t, encoding="utf-8")
print("DESPUES 474:")
nt = ov.read_text(encoding="utf-8")
for m in re.finditer(r".{0,60}474.{0,40}", nt):
    print(" ", m.group(0).replace("\n", " "))
print("LISTO KPIS6")
