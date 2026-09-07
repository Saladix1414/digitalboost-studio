#!/usr/bin/env python3
from pathlib import Path
import re

ov = Path("src/CommerceOSOverview.tsx")
t = ov.read_text(encoding="utf-8")
print("metrics lines:")
for i, line in enumerate(t.splitlines(), 1):
    if "label:" in line or "Ticket" in line or "PRODUCTOS" in line or "118" in line:
        print(f"{i}: {line.strip()[:120]}")

repls = [
    ("String(orders?.length || 4)", "String(Math.max(1, Math.round((orders?.length || 4) * osMul)))"),
    ("String((orders || []).length || 4)", "String(Math.max(1, Math.round(((orders || []).length || 4) * osMul)))"),
    ("String(orders.length || 4)", "String(Math.max(1, Math.round((orders.length || 4) * osMul)))"),
    ("String(customers?.length || 4)", "String(Math.max(1, Math.round((customers?.length || 4) * osMul)))"),
    ("String((customers || []).length || 4)", "String(Math.max(1, Math.round(((customers || []).length || 4) * osMul)))"),
    ("String(customers.length || 4)", "String(Math.max(1, Math.round((customers.length || 4) * osMul)))"),
    ("money(ticket || 118)", "money(Math.round((ticket || 118) * osMul))"),
    ("money(118)", "money(Math.round(118 * osMul))"),
]
n = 0
for a, b in repls:
    if a in t and b not in t:
        t = t.replace(a, b)
        print("ok", a[:40])
        n += 1
ov.write_text(t, encoding="utf-8")
print("cambios", n)
print("LISTO KPIS8")
