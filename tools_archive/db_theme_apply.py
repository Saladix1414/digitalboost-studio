#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
studio = src / "DigitalBoostStoreStudio.tsx"
if not studio.is_file():
    raise SystemExit("Falta DigitalBoostStoreStudio.tsx")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(studio, studio.with_name("DigitalBoostStoreStudio.before_visual_rebuild_" + stamp + ".tsx"))

css = src / "digitalboost-store-theme.css"
css.write_text("""
.db-store-paper{background:var(--store-bg,#F4F1EA)!important;color:var(--store-text,#101820)!important}
.db-store-paper [class*="text-black"]{color:var(--store-muted,#5C6570)!important}
.db-store-cta{background:var(--store-primary,#101820)!important;color:var(--store-bg,#F4F1EA)!important}
""", encoding="utf-8")
print("ok css")

t = studio.read_text(encoding="utf-8")
if 'import "./digitalboost-store-theme.css"' not in t:
    t = 'import "./digitalboost-store-theme.css";\n' + t
t = t.replace("bg-[#F4F1EA] text-[#101820]", "db-store-paper")
t = t.replace("bg-[#F4F1EA]", "db-store-paper")
if "const paper =" not in t and "const [theme, setTheme]" in t:
    t = t.replace(
        "return (",
        "const paper = { ['--store-bg']: theme.bg, ['--store-text']: theme.text, ['--store-muted']: theme.muted, ['--store-primary']: theme.primary, ['--store-accent']: theme.accent } as any;\n  return (",
        1,
    )
if "style={paper}" not in t and "const paper =" in t:
    t = t.replace(
        'className={cx("mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl"',
        'style={paper} className={cx("mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl"',
        1,
    )
studio.write_text(t, encoding="utf-8")
print("ok studio")
print("LISTO THEME APPLY")
print("Theme -> Noir o Ember tiene que cambiar el canvas")
