#!/usr/bin/env python3
from pathlib import Path
p = Path("src/DigitalBoostPulseSkills.ts")
if not Path("src").is_dir():
    raise SystemExit("cd digitalboost-studio")
L = [
"import type { PulseInput } from './DigitalBoostPulseKB';",
"import { toolInspect, toolScoreLine } from './DigitalBoostPulseTools';",
"function money(n: number) { return 'US$ ' + n.toLocaleString('es-AR'); }",
"function studio(i: PulseInput) {",
"  return i.section === 'website-builder' || i.section === 'store-builder' || i.section === 'builder';",
"}",
"function heroDraft(f: { heroTitle: string }) {",
"  const alt = f.heroTitle.indexOf('permiso') !== -1;",
"  return { kind: 'hero', title: alt ? 'La pieza que se explica sola.' : 'La coleccion que no pide permiso.', body: 'Una promesa. Un boton.', cta: 'Entrar' };",
"}",
"export function skillBriefing(i: PulseInput) {",
"  const f = toolInspect(i);",
"  if (studio(i)) {",
"    const hero = f.heroTitle ? '«' + f.heroTitle + '»' : 'vacio';",
"    return { title: 'PULSE Design', body: 'Inspeccion de ' + f.page + ' en ' + f.store + ': ' + f.blocks + ' bloques. Hero ' + hero + (f.genericHero ? ' — plantilla.' : '.') + ' ' + toolScoreLine(f) + '. ' + (f.notes.join('. ') || 'Fold ordenado') + '. Outline esta abajo.', action: 'website-builder', label: 'Seguir', draft: heroDraft(f) };",
"  }",
"  return { title: 'PULSE', body: f.store + ' · ' + f.range + (f.live ? ' · live' : '') + '. ' + toolScoreLine(f) + '. Demo: ' + money(f.sales) + ', ' + f.orders + ' pedidos. 1047 y cap. Cerramos despacho?', action: 'dashboard', label: 'Quedarme aca' };",
"}",
"export function skillPlan(i: PulseInput) {",
"  const f = toolInspect(i);",
"  if (studio(i)) return { title: 'PULSE Design', body: 'Plan: ' + toolScoreLine(f) + '. ' + (f.genericHero ? '1) Hero. ' : '1) Hero con voz. ') + (f.missingCta ? '2) ' + f.missingCta + ' CTA. ' : '2) CTA ok. ') + '3) Un theme.', action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };",
"  return { title: 'PULSE', body: 'Hoy: 1) 1047. 2) Anotar cap. 3) Canvas si el hero es plantilla. 4) Campana = Pulse Card.', action: 'orders', label: 'Ir a Pedidos' };",
"}",
"export function skillAlerta(i: PulseInput) {",
"  const f = toolInspect(i);",
"  if (studio(i)) return { title: 'PULSE Design', body: toolScoreLine(f) + '. ' + (f.notes.join('. ') || 'Sin alerta dura') + '.', action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };",
"  return { title: 'PULSE', body: toolScoreLine(f) + '. Rojos: cap, 1047, mobile. Health no escribe inventario.', action: '__health', label: 'Abrir Health' };",
"}",
"export function skillHero(i?: PulseInput) {",
"  const f = toolInspect(i);",
"  return { title: 'PULSE Design', body: 'El hero de ' + f.page + ' dice «' + (f.heroTitle || 'sin titulo') + '». ' + (f.genericHero ? 'Es plantilla.' : 'Ya tiene voz; te dejo otra linea.') + ' L1, History revierte.', action: 'website-builder', label: 'Aplicar hero', draft: heroDraft(f) };",
"}",
]
p.write_text("\n".join(L) + "\n", encoding="utf-8")
print("ok skills", len(L))
