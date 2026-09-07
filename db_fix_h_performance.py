from pathlib import Path
src = Path("src")
seo = src / "DigitalBoostSeo.ts"
t = seo.read_text(encoding="utf-8")
t = t.replace("Performance queda 100 sin Lighthouse.", "Performance pendiente sin Lighthouse/PageSpeed — no se finge 100.")
seo.write_text(t, encoding="utf-8")
print("✅ Performance honesto")
