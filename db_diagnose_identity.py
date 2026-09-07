#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
print("=== DIAGNOSTICO IDENTIDAD ===")
print("tokens:", (src / "digitalboost-tokens.css").exists())
print("navy identity:", (src / "commerce-os-navy-identity.css").exists())
ov = src / "CommerceOSOverview.tsx"
t = ov.read_text(encoding="utf-8") if ov.exists() else ""
print("overview tiene nimbus.digitalboost.shop:", "nimbus.digitalboost.shop" in t.lower())
print("overview aún tiene aura.digitalboost.shop:", "aura.digitalboost.shop" in t.lower())
print("overview importa tokens:", "digitalboost-tokens.css" in t)
ws = src / "StoreBuilderWorkspace.tsx"
wt = ws.read_text(encoding="utf-8") if ws.exists() else ""
print("workspace carga tokens:", "digitalboost-tokens.css" in wt)
print("workspace aún tiene bg-[#F5F7FB]:", "bg-[#F5F7FB]" in wt)
print("workspace gated:", 'data-store-builder={section === "website-builder"' in wt)
seo = src / "DigitalBoostSeo.ts"
st = seo.read_text(encoding="utf-8") if seo.exists() else ""
print("seo SEED Aura:", "Campera Aura" in st)
print("seo SEED Nimbus:", "Campera Nimbus" in st)
