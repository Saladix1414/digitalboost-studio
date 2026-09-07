#!/usr/bin/env python3
from pathlib import Path

ov = Path("src/CommerceOSOverview.tsx")
t = ov.read_text(encoding="utf-8")
old = "money(sales || 474)"
new = "money(Math.round((sales || 474) * osMul))"
if old in t:
    t = t.replace(old, new)
    print("ok ventas")
else:
    print("NO encontre money(sales || 474)")
t = t.replace("money(ticket || 118)", "money(Math.round((ticket || 118) * osMul))")
t = t.replace("money(118)", "money(Math.round(118 * osMul))")
ov.write_text(t, encoding="utf-8")
print("check:", "sales || 474) * osMul" in ov.read_text(encoding="utf-8"))
print("LISTO KPIS7")
