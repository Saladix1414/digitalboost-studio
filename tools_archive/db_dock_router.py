#!/usr/bin/env python3
from pathlib import Path
import re

src = Path("src")
dock = src / "DigitalBoostStudioDock.tsx"
ws = src / "StoreBuilderWorkspace.tsx"
if not dock.is_file() or not ws.is_file():
    raise SystemExit("cd digitalboost-studio")

t = dock.read_text(encoding="utf-8")
i = t.find("function boot()")
if i < 0:
    i = t.find("let dockRoot")
if i < 0:
    raise SystemExit("no boot en dock")

boot = []
def w(s=""):
    boot.append(s)

w("function readSection() {")
w("  try {")
w("    const u = new URL(window.location.href);")
w("    const q = u.searchParams.get('section') || '';")
w("    if (q) return q;")
w("    const hash = (u.hash || '').replace('#/', '').replace('#', '');")
w("    if (hash && hash.indexOf('=') === -1 && hash.length < 40) return hash;")
w("    return localStorage.getItem('db-os-section-v1') || '';")
w("  } catch { return ''; }")
w("}")
w("function isBuilderSection(s: string) {")
w("  return s === 'website-builder' || s === 'store-builder' || s === 'builder' || s === 'studio';")
w("}")
w("function studioMounted() {")
w("  try {")
w("    return !!(document.querySelector('[data-store-builder]') || document.querySelector('[data-db-studio]') || document.querySelector('[data-website-builder]'));")
w("  } catch { return false; }")
w("}")
w("let dockRoot: ReturnType<typeof createRoot> | null = null;")
w("function boot() {")
w("  if (typeof document === 'undefined') return;")
w("  if (!(isBuilderSection(readSection()) && studioMounted())) return;")
w("  if (document.getElementById('db-studio-dock')) return;")
w("  const el = document.createElement('div');")
w("  el.id = 'db-studio-dock';")
w("  document.body.appendChild(el);")
w("  dockRoot = createRoot(el);")
w("  dockRoot.render(<Dock />);")
w("}")
w("function unboot() {")
w("  const el = document.getElementById('db-studio-dock');")
w("  if (dockRoot) { try { dockRoot.unmount(); } catch {} dockRoot = null; }")
w("  if (el && el.parentNode) el.parentNode.removeChild(el);")
w("}")
w("function sync() {")
w("  if (isBuilderSection(readSection()) && studioMounted()) boot();")
w("  else unboot();")
w("}")
w("if (typeof window !== 'undefined') {")
w("  window.addEventListener('popstate', sync);")
w("  window.addEventListener('hashchange', sync);")
w("  window.addEventListener('db-section', sync);")
w("  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);")
w("  else sync();")
w("  setInterval(sync, 400);")
w("}")
w("export default Dock;")
w("")
dock.write_text(t[:i] + "\n".join(boot), encoding="utf-8")
print("ok dock lee ?section=")

wst = ws.read_text(encoding="utf-8")
helper = '''
function publishSection(id: string) {
  try {
    localStorage.setItem("db-os-section-v1", id);
    const u = new URL(window.location.href);
    u.searchParams.set("section", id);
    window.history.replaceState({}, "", u.toString());
    window.dispatchEvent(new Event("db-section"));
  } catch {}
}
'''
if "function publishSection" not in wst:
    # drop after imports / before component
    m = re.search(r"export default function StoreBuilderWorkspace", wst)
    if m:
        wst = wst[:m.start()] + helper + wst[m.start():]
        print("ok publishSection")
    else:
        wst = helper + wst
        print("ok publishSection top")

if "publishSection(section)" not in wst:
    # hook after useState section
    needle = "const [section, setSection] = useState"
    idx = wst.find(needle)
    if idx != -1:
        # insert effect after the useState block — find the next ';' of that statement is hard;
        # add a dedicated effect after the line that contains setSection useState
        nl = wst.find("\n", idx)
        # skip possibly multi-line useState
        brace = wst.find(");", idx)
        insert_at = (brace + 2) if brace != -1 and brace < idx + 800 else nl
        effect = """
  useEffect(function () { publishSection(String(section)); }, [section]);
"""
        if "useEffect" not in wst[:400]:
            wst = wst.replace('from "react"', 'from "react"', 1)
            if "useEffect" not in wst.split("from \"react\"")[0][-80:]:
                wst = wst.replace("import { useState", "import { useEffect, useState", 1)
                wst = wst.replace("import { useMemo, useState", "import { useEffect, useMemo, useState", 1)
                wst = wst.replace("import { useRef, useState", "import { useEffect, useRef, useState", 1)
        wst = wst[:insert_at] + effect + wst[insert_at:]
        print("ok effect URL")
    else:
        print("WARN no setSection — URL se actualiza a mano")

# landing / dashboard must not keep builder in URL if they render marketing
ws.write_text(wst, encoding="utf-8")
print("LISTO ROUTER")
print("Builder => ?section=website-builder")
print("Landing / OS => dock off (no data-store-builder)")
