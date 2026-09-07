#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
print("=== FIX F: Design System ===")
tokens = """:root{
  --db-navy-950:#070D18; --db-navy-900:#0A1020; --db-navy-800:#101B32; --db-navy-700:#14233F;
  --db-violet:#7C3AED; --db-violet-400:#A78BFA; --db-cyan:#06B6D4; --db-cyan-300:#67E8F9;
  --db-text:#F7FAFF; --db-text-muted:#AFC0D5; --db-border:rgba(247,250,255,0.10);
}
[data-commerce-os]{ background:var(--db-navy-900); color:var(--db-text); }
.db-commerce-white{ background:var(--db-navy-900) !important; color:var(--db-text) !important; }
"""
(src / "digitalboost-tokens.css").write_text(tokens, encoding="utf-8")
navy = """
[data-commerce-os="true"] .bg-[#0A1020]{ background-color:var(--db-navy-900) !important; }
[data-commerce-os="true"] .bg-[#101B32]{ background-color:var(--db-navy-800) !important; }
[data-commerce-os="true"] .bg-[#14233F]{ background-color:var(--db-navy-700) !important; }
[data-commerce-os="true"] .bg-cyan-400{ background-color:var(--db-cyan) !important; }
[data-commerce-os="true"] .bg-violet-500{ background-color:var(--db-violet) !important; }
"""
(src / "commerce-os-navy-identity.css").write_text(navy, encoding="utf-8")
overview = src / "CommerceOSOverview.tsx"
t = overview.read_text(encoding="utf-8")
if "digitalboost-tokens.css" not in t:
    t = t.replace('import "./commerce-os-core.css";','import "./digitalboost-tokens.css";\nimport "./commerce-os-core.css";\nimport "./commerce-os-navy-identity.css";')
t = t.replace("aura.digitalboost.shop", "nimbus.digitalboost.shop")
overview.write_text(t, encoding="utf-8")
print("✅ Overview + tokens listos")
