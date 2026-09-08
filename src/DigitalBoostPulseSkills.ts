import { boostHero } from "./DigitalBoostPulseBoost";
import type { PulseInput } from "./DigitalBoostPulseKB";
import { toolInspect, toolScoreLine } from "./DigitalBoostPulseTools";
import { seoFixProposal, seoSpeak } from "./DigitalBoostPulseSeo";
function studio(i: PulseInput) { return i.section === 'website-builder' || i.section === 'store-builder' || i.section === 'builder'; }
function heroDraft(f: any, q?: string) {
  return Object.assign({ kind: "hero" }, boostHero(q || "", f && f.heroTitle || ""));
}
export function skillBriefing(i: PulseInput) {
  if (i.section === 'seo') return seoSpeak();
  const f = toolInspect(i);
  if (studio(i)) {
    const hit = f.heroTitle ? 'Ahora el hero dice «' + f.heroTitle + '».' : 'El hero todavía está vacío.';
    const next = f.genericHero
      ? 'Sigue pareciendo plantilla. Si querés, te dejo otra línea y la aplicás vos.'
      : (f.missingCta
        ? 'Le falta un pedido claro en ' + f.missingCta + ' bloque' + (f.missingCta === 1 ? '' : 's') + '.'
        : 'El inicio ya se sostiene. Si seguimos, miramos SEO o el pedido 1047.');
    return { title: 'PULSE', body: 'Estamos en ' + f.page + ' · ' + f.blocks + ' bloques.\n' + hit + '\n' + next, action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };
  }
  return { title: 'PULSE', body: 'Hoy en ' + f.store + ' (' + f.range + (f.live ? ', en vivo' : '') + ').\nEl 1047 sigue en preparación y el cap está justo.\n¿Despacho, SEO o el canvas?', action: 'dashboard', label: 'Quedarme acá' };
}
export function skillPlan(i: PulseInput) {
  if (i.section === 'seo') return seoSpeak();
  const f = toolInspect(i);
  if (studio(i)) return { title: 'PULSE', body: 'Hoy yo haría esto:\n1) ' + (f.genericHero ? 'ponerle voz al hero' : 'dejar el hero como está, ya tiene voz') + '\n2) ' + (f.missingCta ? 'completar ' + f.missingCta + ' botones que no piden nada' : 'los botones ya piden') + '\n3) un solo theme, no dos caras.\nCampaña no. Eso espera tu OK.', action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };
  return { title: 'PULSE', body: 'Hoy, en orden:\n1) sacar el 1047\n2) anotar el cap\n3) SEO solo si Health lo pide\n4) campaña de carritos: te la armo, no la publico sola.', action: 'orders', label: 'Ir a Pedidos' };
}
export function skillAlerta(i: PulseInput) {
  if (i.section === 'seo') return seoSpeak();
  const f = toolInspect(i);
  if (studio(i)) return { title: 'PULSE', body: (f.notes.join('. ') || 'En el inicio no veo nada urgente.') + '\nSi hay que tocar el hero, lo aplicás vos.', action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };
  return { title: 'PULSE', body: 'Lo que está rojo: cap, el 1047 y el mobile.\nHealth te muestra el diagnóstico. Yo no toco inventario desde acá.', action: '__health', label: 'Abrir Health' };
}
export function skillHero(i?: PulseInput) {
  const f = toolInspect(i);
  const now = f.heroTitle || 'todavía sin título';
  return { title: 'PULSE', body: 'Hoy dice «' + now + '».\n' + (f.genericHero ? 'Es plantilla. Te dejo una línea con más carácter.' : 'Ya tiene voz. Si querés tensar, te dejo la otra.') + '\nAbajo está la propuesta. La aplicás vos; History la revierte.', action: 'website-builder', label: 'Aplicar hero', draft: heroDraft(f, i && i.q) };
}
export function skillSeoFix(_i?: PulseInput) { return seoFixProposal(); }
