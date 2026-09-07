from pathlib import Path
src = Path("src")
skills = src / "DigitalBoostPulseSkills.ts"
if skills.is_file():
    t = skills.read_text(encoding="utf-8")
    if "DigitalBoostPulseOllama" not in t:
        t = t.replace("import type { PulseInput }", "import { pulseOllamaHero } from './DigitalBoostPulseOllama';\nimport type { PulseInput }")
        t = t.replace("export function skillHero(i?: PulseInput) {", "export async function skillHeroOllama(i?: PulseInput) { const f = toolInspect(i); try { const summary = f'{f.page} {f.heroTitle} {f.blocks} bloques'; const draft = await pulseOllamaHero(summary); if(draft) return { title:'PULSE • Nimbus AI', body: f'Hero con {draft.source}: «{draft.title}»', action:'website-builder', label:'Aplicar hero IA', draft }; } catch {} return skillHero(i); }\nexport function skillHero(i?: PulseInput) {")
        skills.write_text(t, encoding="utf-8")
        print("✅ PulseSkills con Ollama")
ov = src / "CommerceOSOverview.tsx"
if ov.is_file():
    t = ov.read_text(encoding="utf-8")
    if "OllamaStatus" not in t:
        t = t.replace("import DigitalBoostOsKpiPaint", "import DigitalBoostOllamaStatus from './DigitalBoostOllamaStatus';\nimport DigitalBoostOsKpiPaint")
        t = t.replace("NIMBUS.DIGITALBOOST.SHOP", "NIMBUS.DIGITALBOOST.SHOP' } />\n <div className=\"mt-2\"><DigitalBoostOllamaStatus /></div>\n <div className=\"hidden'>{/*")
        ov.write_text(t, encoding="utf-8")
        print("✅ Overview con status")
