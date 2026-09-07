#!/usr/bin/env python3
# db_fix_a_dock_only.py — FIX A: Dock solo en Store Builder
from pathlib import Path
import re
src = Path("src")
def patch_workspace():
    ws = src / "StoreBuilderWorkspace.tsx"
    t = ws.read_text(encoding="utf-8")
    if './DigitalBoostStudioDock' not in t:
        t = t.replace('import DigitalBoostSeoCenter from "./DigitalBoostSeoCenter";','import DigitalBoostSeoCenter from "./DigitalBoostSeoCenter";\nimport "./DigitalBoostStudioDock";')
    t = re.sub(r'data-store-builder-vibrant="true"\s+data-store-builder="true"','data-store-builder-vibrant="true" data-store-builder={section === "website-builder" ? "true" : "false"} data-os-section={section}',t)
    t = re.sub(r'data-os-section=\{section\}\s+data-os-section=\{section\}', 'data-os-section={section}', t)
    t = t.replace('db-commerce-white flex h-screen','flex h-screen')
    t = t.replace('bg-[#F5F7FB] text-[#172033]','bg-[#070d18] text-[#F7FAFF]')
    ws.write_text(t, encoding="utf-8")
    print("✅ Workspace gated")
def patch_dock():
    dock = src / "DigitalBoostStudioDock.tsx"
    d = dock.read_text(encoding="utf-8")
    d = d.replace("document.body.classList.contains('db-pulse-open')) return null;","document.body.classList.contains('db-pulse-open') || document.body.classList.contains('db-seo-open'))) return null;")
    d = d.replace("return u.searchParams.get('section') || localStorage.getItem('db-os-section-v1') || '';","return u.searchParams.get('section') || localStorage.getItem('db-os-section-v1') || localStorage.getItem('digitalboost_store_section') || '';")
    new_instudio = """function inStudio() {
  // FIX A: Gated por sección, no por data-attr global
  try {
    const s = readSection();
    return s === 'website-builder';
  } catch { return false; }
}"""
    d = re.sub(r'function inStudio\(\) \{.*?\n\}', new_instudio + "\n", d, flags=re.DOTALL)
    dock.write_text(d, encoding="utf-8")
    print("✅ Dock solo website-builder")
patch_workspace()
patch_dock()
