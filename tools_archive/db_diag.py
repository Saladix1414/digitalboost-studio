#!/usr/bin/env python3
from pathlib import Path
import re, subprocess

root = Path.cwd()
idx = root / "index.html"
if idx.is_file():
    t = idx.read_text(encoding="utf-8")
    t2 = re.sub(r"<script>\s*window\.addEventListener\([\"']error[\"'][\s\S]*?</script>", "", t)
    t2 = t2.replace("z-index:99999", "")
    idx.write_text(t2, encoding="utf-8")
    print("ok index")

print("---- BUILD ----")
r = subprocess.run(["npm", "run", "build"], cwd=root, capture_output=True, text=True)
out = (r.stdout or "") + "\n" + (r.stderr or "")
(root / "_diag_build.log").write_text(out, encoding="utf-8")
print("\n".join(out.splitlines()[-80:]))
print("EXIT", r.returncode)
