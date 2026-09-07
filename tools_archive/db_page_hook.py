#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

HOOK = (
    "\n  useEffect(function () {\n"
    "    try { (window as any).__dbSetPage = setPage; } catch {}\n"
    "    function onPage(ev) {\n"
    "      const name = ev && ev.detail;\n"
    "      if (typeof name === 'string' && name) setPage(name);\n"
    "    }\n"
    "    window.addEventListener('db-page', onPage);\n"
    "    return function () { window.removeEventListener('db-page', onPage); };\n"
    "  }, []);\n"
)

for f in list(src.glob("*.tsx")):
    t = f.read_text(encoding="utf-8")
    if "const [page, setPage]" not in t or "__dbSetPage" in t:
        continue
    if "useEffect" not in t[:500]:
        t = t.replace("import { useState", "import { useEffect, useState", 1)
    i = t.find("const [page, setPage]")
    end = t.find(";", i)
    if end == -1:
        continue
    f.write_text(t[: end + 1] + HOOK + t[end + 1 :], encoding="utf-8")
    print("ok hook", f.name)

dock = src / "DigitalBoostStudioDock.tsx"
if dock.is_file():
    d = dock.read_text(encoding="utf-8")
    d = d.replace(
        'localStorage.setItem("db-store-page-v1", name);',
        'localStorage.setItem("db-store-page-v1", name); try { const w = window; if (w.__dbSetPage) w.__dbSetPage(name); w.dispatchEvent(new CustomEvent("db-page", { detail: name })); } catch {}',
        1,
    )
    dock.write_text(d, encoding="utf-8")
    print("ok dock")
print("LISTO HOOK")
