#!/usr/bin/env python3
from pathlib import Path
src = Path("src") / "DigitalBoostStudioDock.tsx"
t = src.read_text(encoding="utf-8")
t = t.replace(
    "if (typeof document !== 'undefined' && document.body.classList.contains('db-pulse-open') || document.body.classList.contains('db-seo-open'))) return null;",
    "if (typeof document !== 'undefined' && (document.body.classList.contains('db-pulse-open') || document.body.classList.contains('db-seo-open'))) return null;"
)
src.write_text(t, encoding="utf-8")
print("✅ Fix parse línea 48")
