#!/usr/bin/env python3
from pathlib import Path
src=Path("src")
def w(name,lines):
    (src/name).write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("ok",name)
w("DigitalBoostPulseOptimize.ts",[
'import { seoFacts, seoFixTop } from "./DigitalBoostPulseSeo";',
'import { toolInspect } from "./DigitalBoostPulseTools";',
'import { applyBlockAt } from "./DigitalBoostPulseApply";',
'import type { PulseInput } from "./DigitalBoostPulseKB";',
'export function pulseOptimizeOnce(input?: PulseInput) {',
'  const facts=toolInspect(input); const seo=seoFacts(); let didHero=false,didSeo=false;',
'  if (facts.genericHero){ try{ applyBlockAt(0,{kind:"hero",title:"La coleccion que no pide permiso.",body:"Una promesa. Un boton.",cta:"Entrar"}); didHero=true;}catch{} }',
'  if (seo.top){ try{ seoFixTop(); didSeo=true;}catch{} }',
'  const parts=[]; if(didHero)parts.push("hero L1"); if(didSeo)parts.push("SEO "+(seo.top?.fixKind||"fix"));',
'  if(!parts.length) return {title:"PULSE",body:"Health "+seo.health+"/100. Limpio.",action:"seo",label:"Abrir SEO"};',
'  return {title:"PULSE",body:"Hecho: "+parts.join(" + ")+". Health "+seo.health+" → revisa SEO y canvas.",action:"seo",label:"Ver resultado"};',
'}',
])
router=src/"DigitalBoostPulseRouter.ts"
t=router.read_text(encoding="utf-8")
if "pulseOptimizeOnce" not in t:
    t=t.replace('import { seoFixTop, seoSpeak } from "./DigitalBoostPulseSeo";','import { seoFixTop, seoSpeak } from "./DigitalBoostPulseSeo";\nimport { pulseOptimizeOnce } from "./DigitalBoostPulseOptimize";')
    t=t.replace("  return null;","  if (hit(q, ['optimizar todo','optimizar','arreglar todo','fix all'])) return finish(input, pulseOptimizeOnce(input));\n  return null;")
    router.write_text(t,encoding="utf-8")
