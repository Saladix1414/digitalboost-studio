#!/usr/bin/env python3
from pathlib import Path

p = Path("src/DigitalBoostStudioDock.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
t = p.read_text(encoding="utf-8")
i = t.find("function boot()")
if i < 0:
    raise SystemExit("no encontre boot()")

boot = []
def w(s=""):
    boot.append(s)

w("let dockRoot: ReturnType<typeof createRoot> | null = null;")
w("function inStudio() {")
w("  try {")
w("    const text = document.body ? document.body.innerText : '';")
w("    if (text.indexOf('STORE BUILDER') !== -1) return true;")
w("    if (text.indexOf('Ecommerce Studio') !== -1) return true;")
w("    if (document.querySelector('[data-db-studio]')) return true;")
w("  } catch {}")
w("  return false;")
w("}")
w("function boot() {")
w("  if (typeof document === 'undefined') return;")
w("  if (!inStudio()) return;")
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
w("  if (inStudio()) boot();")
w("  else unboot();")
w("}")
w("if (typeof window !== 'undefined') {")
w("  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);")
w("  else sync();")
w("  setInterval(sync, 500);")
w("}")
w("export default Dock;")
w("")

p.write_text(t[:i] + "\n".join(boot), encoding="utf-8")
print("LISTO HIDE")
print("Dock solo si el DOM dice STORE BUILDER")

