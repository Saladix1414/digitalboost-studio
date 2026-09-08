import type { PulseInput, PulseDecision } from "./DigitalBoostPulseKB";
import { toolDiff, toolInspect, toolMap, toolNba, toolOrders, toolRange, toolScoreLine, toolStock, toolTheme } from "./DigitalBoostPulseTools";
import { seoFixProposal, seoSpeak } from "./DigitalBoostPulseSeo";
import { pulseOptimizeOnce } from "./DigitalBoostPulseOptimize";
function hit(q: string, keys: string[]) { for (let i = 0; i < keys.length; i++) if (q.indexOf(keys[i]) !== -1) return true; return false; }
export function routeTools(input: PulseInput, q: string, finish: (i: PulseInput, p: any) => PulseDecision): PulseDecision | null {
  const f = toolInspect(input);
  if (hit(q, ['seo', 'meta', 'sitemap', 'robots', 'canonical', 'indexa', 'keyword', 'auditar'])) {
    if (hit(q, ['optimiz', 'fix', 'aplicar', 'correg', 'alt'])) return finish(input, seoFixProposal());
    return finish(input, seoSpeak());
  }
  if (hit(q, ['inspecc', 'auditar', 'score', 'puntaje'])) return finish(input, { title: 'PULSE', body: toolScoreLine(f) + '. ' + f.store + ' · ' + f.page + ' · ' + f.blocks + ' bloques. Hero: «' + (f.heroTitle || '-') + '». ' + (f.notes.join('. ') || 'Sin notas.'), action: input.section === 'website-builder' ? 'website-builder' : 'dashboard', label: 'Seguir' });
  if (hit(q, ['mapa', 'bloques', 'estructura', 'outline'])) return finish(input, { title: 'PULSE', body: toolMap(f), action: 'website-builder', label: 'Abrir canvas' });
  if (hit(q, ['siguiente', 'nba', 'que hago', 'qué hago', 'golpe'])) return finish(input, toolNba(f));
  if (hit(q, ['diff', 'compar', 'antes'])) return finish(input, toolDiff(f));
  if (hit(q, ['theme', 'noir', 'preset', 'cambiar theme', 'pasar a noir'])) return finish(input, toolTheme(f));
  if (hit(q, ['publicar', 'publish', 'lanzar'])) { const ok = f.score >= 70 && !f.genericHero; return finish(input, { title: 'PULSE', body: toolScoreLine(f) + '. ' + (ok ? 'Fold listo para Preview. Publicar no dispara campana.' : 'Todavia no: ' + (f.notes.join(', ') || 'sube el score') + '.'), action: 'website-builder', label: 'Seguir' }); }
  if (hit(q, ['rango', '7d', '30d', '90d'])) return finish(input, toolRange(f));
  if (hit(q, ['1048', '1047', 'pedido', 'despacho', 'envio'])) return finish(input, toolOrders(f));
  if (hit(q, ['stock', 'cap', 'invent', 'sku'])) return finish(input, toolStock(f));
  if (hit(q, ['optimizar todo','optimizar','arreglar todo','fix all'])) return finish(input, pulseOptimizeOnce(input));
  return null;
}
