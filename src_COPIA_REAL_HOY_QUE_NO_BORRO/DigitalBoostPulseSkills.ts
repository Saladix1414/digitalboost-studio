import type { PulseInput } from "./DigitalBoostPulseKB";
import { toolInspect, toolScoreLine } from "./DigitalBoostPulseTools";
import { seoFixTop, seoSpeak } from "./DigitalBoostPulseSeo";
function studio(i: PulseInput) { return i.section === 'website-builder' || i.section === 'store-builder' || i.section === 'builder'; }
function heroDraft(f: { heroTitle: string }) { return { kind: 'hero', title: 'La coleccion que no pide permiso.', body: 'Una promesa. Un boton.', cta: 'Entrar' }; }
export function skillBriefing(i: PulseInput) {
  if (i.section === 'seo') return seoSpeak();
  const f = toolInspect(i);
  if (studio(i)) return { title: 'PULSE IA', body: f.page + ', ' + f.blocks + ' bloques. ' + toolScoreLine(f), action: 'website-builder', label: 'Seguir', draft: f.genericHero? heroDraft(f) : undefined };
  return { title: 'PULSE IA', body: f.store + ' · ' + f.range, action: 'dashboard', label: 'Quedarme aca' };
}
export function skillPlan(i: PulseInput) { return skillBriefing(i); }
export function skillAlerta(i: PulseInput) { return skillBriefing(i); }
export function skillHero(i?: PulseInput) { const f = toolInspect(i as any); return { title: 'PULSE IA', body: 'Hero: ' + (f.heroTitle || 'sin titulo'), action: 'website-builder', label: 'Aplicar', draft: heroDraft(f) }; }
export function skillSeoFix(_i?: PulseInput) { return seoFixTop(); }
