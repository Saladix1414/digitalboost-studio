import { seoFacts, seoFixTop } from "./DigitalBoostPulseSeo";
import { toolInspect } from "./DigitalBoostPulseTools";
import { applyBlockAt } from "./DigitalBoostPulseApply";
import type { PulseInput } from "./DigitalBoostPulseKB";
export function pulseOptimizeOnce(input?: PulseInput) {
  const facts=toolInspect(input); const seo=seoFacts(); let didHero=false,didSeo=false;
  if (facts.genericHero){ try{ applyBlockAt(0,{kind:"hero",title:"La coleccion que no pide permiso.",body:"Una promesa. Un boton.",cta:"Entrar"}); didHero=true;}catch{} }
  if (seo.top){ try{ seoFixTop(); didSeo=true;}catch{} }
  const parts=[]; if(didHero)parts.push("hero L1"); if(didSeo)parts.push("SEO "+(seo.top?.fixKind||"fix"));
  if(!parts.length) return {title:"PULSE",body:"Health "+seo.health+"/100. Limpio.",action:"seo",label:"Abrir SEO"};
  return {title:"PULSE",body:"Hecho: "+parts.join(" + ")+". Health "+seo.health+" → revisa SEO y canvas.",action:"seo",label:"Ver resultado"};
}
