from pathlib import Path
p = Path("src/DigitalBoostPulseSkills.ts")
t = p.read_text(encoding="utf-8")
t = t.replace("f'{f.page} {f.heroTitle} {f.blocks} bloques'", "`${f.page} ${f.heroTitle} ${f.blocks} bloques`")
t = t.replace("f'Hero con {draft.source}: «{draft.title}»'", "`Hero con ${draft.source}: «${draft.title}»`")
p.write_text(t, encoding="utf-8")
print("✅ parse error arreglado")
