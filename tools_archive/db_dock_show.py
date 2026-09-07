#!/usr/bin/env python3
from pathlib import Path

p = Path("src/DigitalBoostStudioDock.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
t = p.read_text(encoding="utf-8")

t = t.replace(
    "const pulseOpen = typeof document !== 'undefined' && !!document.querySelector('[role=\"dialog\"]');\n  if (pulseOpen) return null;",
    "",
)
t = t.replace(
    'const pulseOpen = typeof document !== "undefined" && !!document.querySelector(\'[role="dialog"]\');\n  if (pulseOpen) return null;',
    "",
)
t = t.replace("if (pulseOpen) return null;", "")

cut = t.find("let dockRoot")
if cut == -1:
    cut = t.find("function boot()")
if cut == -1:
    cut = t.find("export default Dock")
if cut != -1:
    t = t[:cut]

boot = []
def w(s=""):
    boot.append(s)

w("function readSection() {")
w("  try {")
w("    const u = new URL(window.location.href);")
w("    return u.searchParams.get('section') || localStorage.getItem('db-os-section-v1') || '';")
w("  } catch { return ''; }")
w("}")
w("function inStudio() {")
w("  try {")
w("    const text = document.body ? document.body.innerText : '';")
w("    if (text.indexOf('Crea. Impulsa') !== -1 && text.indexOf('STORE BUILDER') === -1) return false;")
w("    if (text.indexOf('STORE BUILDER') !== -1) return true;")
w("    if (text.indexOf('Ecommerce Studio') !== -1) return true;")
w("    if (document.querySelector('[data-store-builder],[data-db-studio],[data-website-builder]')) return true;")
w("    const s = readSection();")
w("    return s === 'website-builder' || s === 'store-builder' || s === 'builder';")
w("  } catch { return false; }")
w("}")
w("let studioDockRoot: ReturnType<typeof createRoot> | null = null;")
w("function bootStudioDock() {")
w("  if (typeof document === 'undefined') return;")
w("  if (!inStudio()) return;")
w("  if (document.getElementById('db-studio-dock')) return;")
w("  const el = document.createElement('div');")
w("  el.id = 'db-studio-dock';")
w("  document.body.appendChild(el);")
w("  studioDockRoot = createRoot(el);")
w("  studioDockRoot.render(<Dock />);")
w("}")
w("function unbootStudioDock() {")
w("  const el = document.getElementById('db-studio-dock');")
w("  if (studioDockRoot) { try { studioDockRoot.unmount(); } catch {} studioDockRoot = null; }")
w("  if (el && el.parentNode) el.parentNode.removeChild(el);")
w("}")
w("function syncStudioDock() {")
w("  if (inStudio()) bootStudioDock();")
w("  else unbootStudioDock();")
w("}")
w("if (typeof window !== 'undefined') {")
w("  window.addEventListener('popstate', syncStudioDock);")
w("  window.addEventListener('hashchange', syncStudioDock);")
w("  window.addEventListener('db-section', syncStudioDock);")
w("  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncStudioDock);")
w("  else syncStudioDock();")
w("  setInterval(syncStudioDock, 400);")
w("}")
w("export default Dock;")
w("")

p.write_text(t.rstrip() + "\n" + "\n".join(boot), encoding="utf-8")
print("ok", "studioDockRoot", p.read_text(encoding="utf-8").count("studioDockRoot"))
print("LISTO SHOW")
