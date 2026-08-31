import type { PulseInput } from "./DigitalBoostPulseKB";
import { toolInspect, toolScoreLine } from "./DigitalBoostPulseTools";
import { seoFixTop, seoSpeak } from "./DigitalBoostPulseSeo";
function studio(i: PulseInput) { return i.section === 'website-builder' || i.section === 'store-builder' || i.section === 'builder'; }
function heroDraft(f: { heroTitle: string }) {
  const alt = (f.heroTitle || '').indexOf('permiso') !== -1;
  return { kind: 'hero', title: alt ? 'La pieza que se explica sola.' : 'La coleccion que no pide permiso.', body: 'Una promesa. Un boton.', cta: 'Entrar' };
}
export function skillBriefing(i: PulseInput) {
  if (i.section === 'seo') return seoSpeak();
  const f = toolInspect(i);
  if (studio(i)) {
    const hit = f.heroTitle ? 'El hero dice «' + f.heroTitle + '»' : 'El hero esta vacio';
    const next = f.genericHero ? 'Sigue siendo plantilla. Reescribirlo es L1.' : (f.missingCta ? 'Faltan ' + f.missingCta + ' CTA.' : 'El fold esta bien. SEO o 1047.');
    return { title: 'PULSE', body: f.page + ', ' + f.blocks + ' bloques. ' + hit + '. ' + toolScoreLine(f) + '. ' + next, action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };
  }
  return { title: 'PULSE', body: f.store + ' · ' + f.range + (f.live ? ' · live' : '') + '. ' + toolScoreLine(f) + '. 1047 en preparacion y cap fino. Despacho, SEO o canvas?', action: 'dashboard', label: 'Quedarme aca' };
}
export function skillPlan(i: PulseInput) {
  if (i.section === 'seo') return seoSpeak();
  const f = toolInspect(i);
  if (studio(i)) return { title: 'PULSE', body: 'Hoy en el canvas: ' + (f.genericHero ? '1) hero. ' : '1) hero con voz. ') + (f.missingCta ? '2) ' + f.missingCta + ' CTA. ' : '2) CTA ok. ') + '3) un theme. No disparamos campana.', action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };
  return { title: 'PULSE', body: 'Hoy: 1) 1047. 2) anotar cap. 3) SEO si el health pega. 4) campana = Pulse Card, L3.', action: 'orders', label: 'Ir a Pedidos' };
}
export function skillAlerta(i: PulseInput) {
  if (i.section === 'seo') return seoSpeak();
  const f = toolInspect(i);
  if (studio(i)) return { title: 'PULSE', body: toolScoreLine(f) + '. ' + (f.notes.join('. ') || 'Nada duro en el fold') + '.', action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };
  return { title: 'PULSE', body: toolScoreLine(f) + '. Rojos: cap, 1047, mobile. Health no escribe inventario.', action: '__health', label: 'Abrir Health' };
}
export function skillHero(i?: PulseInput) {
  const f = toolInspect(i);
  return { title: 'PULSE', body: 'El hero de ' + f.page + ' dice «' + (f.heroTitle || 'sin titulo') + '». ' + (f.genericHero ? 'Es plantilla. Te dejo una linea. L1, History revierte.' : 'Ya tiene voz. Te dejo otra por si queres tensar.') , action: 'website-builder', label: 'Aplicar hero', draft: heroDraft(f) };
}
export function skillSeoFix(_i?: PulseInput) { return seoFixTop(); }
