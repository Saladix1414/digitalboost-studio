#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
ws = root / "src" / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ws, ws.with_name("StoreBuilderWorkspace.before_visual_rebuild_" + stamp + ".tsx"))
print("backup ok")

(root / "src" / "digitalboost-qa.css").write_text(r"""
:root { --db-tap: 44px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
.db-cmd-overlay, .db-cmd-panel { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
.db-cmd-item, .db-cmd-panel input { min-height: var(--db-tap); }
[data-store-builder="true"] > main > header button,
[data-store-builder="true"] > aside button {
  min-height: var(--db-tap);
  min-width: var(--db-tap);
}
[data-commerce-os="true"] button {
  min-height: var(--db-tap);
}
:focus-visible {
  outline: 2px solid #22D3EE;
  outline-offset: 2px;
}
@media (max-width: 640px) {
  .db-cmd-overlay { padding-top: 8vh; align-items: flex-end; }
  [data-store-builder="true"] > main > header { height: 56px; }
}
@media (min-width: 1024px) {
  [data-store-builder="true"] > aside { min-width: 220px; }
}
""", encoding="utf-8")
print("ok qa css")

txt = ws.read_text(encoding="utf-8")
if "digitalboost-qa.css" not in txt:
    lines = txt.splitlines(True)
    last = 0
    for n, line in enumerate(lines):
        if line.startswith("import "):
            last = n
    lines.insert(last + 1, 'import "./digitalboost-qa.css";\n')
    txt = "".join(lines)
    print("ok import qa")
ws.write_text(txt, encoding="utf-8")

cc = root / "src" / "DigitalBoostCommandCenter.tsx"
if cc.is_file():
    shutil.copy2(cc, cc.with_name("DigitalBoostCommandCenter.before_visual_rebuild_" + stamp + ".tsx"))
    body = cc.read_text(encoding="utf-8")
    body = body.replace(
        'className="db-cmd-overlay"',
        'className="db-cmd-overlay" role="dialog" aria-modal="true" aria-label="Command Center"',
        1,
    )
    body = body.replace(
        'placeholder="Command Center  ·  Ctrl K"',
        'placeholder="Command Center  ·  Ctrl K" aria-label="Buscar comando"',
        1,
    )
    if 'import "./digitalboost-qa.css"' not in body:
        if 'import "./digitalboost-os.css";' in body:
            body = body.replace('import "./digitalboost-os.css";', 'import "./digitalboost-os.css";\nimport "./digitalboost-qa.css";', 1)
        else:
            body = 'import "./digitalboost-qa.css";\n' + body
    cc.write_text(body, encoding="utf-8")
    print("ok command a11y")

for rel in ["DigitalBoostOperator.tsx", "DigitalBoostHealth.tsx", "DigitalBoostIntegrations.tsx", "DigitalBoostAutomations.tsx", "DigitalBoostConsole.tsx", "DigitalBoostNotifications.tsx", "DigitalBoostShortcuts.tsx", "DigitalBoostThemePanel.tsx", "DigitalBoostHistoryPanel.tsx"]:
    p = root / "src" / rel
    if not p.is_file():
        continue
    t = p.read_text(encoding="utf-8")
    if 'role="dialog"' in t:
        continue
    t2 = t.replace(
        'className="fixed inset-0 z-[120]',
        'role="dialog" aria-modal="true" className="fixed inset-0 z-[120]',
        1,
    )
    t2 = t2.replace(
        'className="fixed inset-0 z-[130]',
        'role="dialog" aria-modal="true" className="fixed inset-0 z-[130]',
        1,
    )
    t2 = t2.replace(
        'className="fixed inset-0 z-[140]',
        'role="dialog" aria-modal="true" className="fixed inset-0 z-[140]',
        1,
    )
    if t2 != t:
        shutil.copy2(p, p.with_name(p.stem + ".before_visual_rebuild_" + stamp + p.suffix))
        p.write_text(t2, encoding="utf-8")
        print("ok a11y", rel)

print("LISTO QA")
print("Responsive + tap 44px + focus + dialogs + reduced motion")
