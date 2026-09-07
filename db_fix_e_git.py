#!/usr/bin/env python3
from pathlib import Path
import shutil
root = Path(".")
gitignore = """# deps
node_modules/
.pnp/
# build
dist/
build/
.vite/
# env
.env
.env.local
# python
__pycache__/
*.pyc
.venv/
# models / ollama — NO subir
ollama/
models/
*.gguf
*.bin
# logs
npm-debug.log*
logs/
.DS_Store
"""
(root / ".gitignore").write_text(gitignore, encoding="utf-8")
print("✅ .gitignore")
archive = Path("tools_archive")
archive.mkdir(exist_ok=True)
moved=0
for p in root.glob("db_*.py"):
    if p.name in ["db_fix_a_dock_only.py","db_fix_b_nimbus.py","db_fix_c_optimize.py","db_fix_d_marketing.py","db_fix_e_git.py","db_hotfix_parse.py"]:
        continue
    try:
        shutil.move(str(p), str(archive / p.name))
        moved+=1
    except: pass
print(f"✅ {moved} scripts movidos a tools_archive/")
