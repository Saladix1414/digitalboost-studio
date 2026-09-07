#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
studio = root / "src" / "DigitalBoostStoreStudio.tsx"
if not studio.is_file():
    raise SystemExit("Falta DigitalBoostStoreStudio.tsx")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(studio, studio.with_name("DigitalBoostStoreStudio.before_visual_rebuild_" + stamp + ".tsx"))

t = studio.read_text(encoding="utf-8")
if "useRef" not in t.split("from \"react\"")[0] + t[t.find("from \"react\""):t.find("from \"react\"")+80]:
    t = t.replace('import { useEffect, useMemo, useState } from "react";', 'import { useEffect, useMemo, useRef, useState } from "react";', 1)
    t = t.replace("import { useEffect, useMemo, useState } from \"react\";", "import { useEffect, useMemo, useRef, useState } from \"react\";", 1)
if "inspectRef" not in t:
    t = t.replace(
        "const [saved, setSaved] = useState(false);",
        "const [saved, setSaved] = useState(false);\n  const inspectRef = useRef<HTMLElement | null>(null);",
        1,
    )
if "inspectRef.current" not in t:
    t = t.replace(
        "useEffect(() => { if (ready) saveCanvas(blocks); }, [blocks, ready]);",
        "useEffect(() => { if (ready) saveCanvas(blocks); }, [blocks, ready]);\n  useEffect(() => { if (selected && inspectRef.current) inspectRef.current.scrollIntoView({ behavior: \"smooth\", block: \"nearest\" }); }, [selected]);",
        1,
    )
if "ref={inspectRef}" not in t:
    t = t.replace(
        '<aside className={cx("overflow-y-auto border-white/10 p-3"',
        '<aside ref={inspectRef} className={cx("overflow-y-auto border-white/10 p-3"',
        1,
    )
    if "ref={inspectRef}" not in t:
        t = t.replace(
            "hidden lg:block",
            "hidden lg:block",
            1,
        )
studio.write_text(t, encoding="utf-8")
print("ok studio")
print("LISTO INSPECT")
print("Toca un bloque del canvas: el inspector baja a la vista")
