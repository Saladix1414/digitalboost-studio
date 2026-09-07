#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
def out(name, lines):
    (src / name).write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("ok", name)

out("DigitalBoostPulseRouter.ts", [
"import type { PulseInput, PulseDecision } from './DigitalBoostPulseKB';",
"import { toolDiff, toolInspect, toolMap, toolNba, toolOrders, toolRange, toolScoreLine, toolStock, toolTheme } from './DigitalBoostPulseTools';",
"function hit(q: string, keys: string[]) { for (let i = 0; i < keys.length; i++) if (q.indexOf(keys[i]) !== -1) return true; return false; }",
"export function routeTools(input: PulseInput, q: string, finish: (i: PulseInput, p: any) => PulseDecision): PulseDecision | null {",
"  const f = toolInspect(input);",
"  if (hit(q, ['inspecc', 'auditar', 'score', 'puntaje'])) return finish(input, { title: 'PULSE · Inspect', body: toolScoreLine(f) + '. ' + f.store + ' · ' + f.page + ' · ' + f.blocks + ' bloques. Hero: «' + (f.heroTitle || '-') + '». ' + (f.notes.join('. ') || 'Sin notas.'), action: input.section === 'website-builder' ? 'website-builder' : 'dashboard', label: 'Seguir' });",
"  if (hit(q, ['mapa', 'bloques', 'estructura'])) return finish(input, { title: 'PULSE · Mapa', body: toolMap(f), action: 'website-builder', label: 'Seguir' });",
"  if (hit(q, ['siguiente', 'nba', 'que hago', 'qué hago', 'golpe'])) return finish(input, toolNba(f));",
"  if (hit(q, ['diff', 'compar', 'antes'])) return finish(input, toolDiff(f));",
"  if (hit(q, ['theme', 'noir', 'aura', 'preset'])) return finish(input, toolTheme(f));",
"  if (hit(q, ['publicar', 'publish', 'lanzar'])) { const ok = f.score >= 70 && !f.genericHero; return finish(input, { title: 'PULSE · Publicar', body: toolScoreLine(f) + '. ' + (ok ? 'Fold listo para Preview. Publicar no dispara campana (L3).' : 'Todavia no: ' + (f.notes.join(', ') || 'sube el score') + '.'), action: 'website-builder', label: 'Seguir' }); }",
"  if (hit(q, ['rango', '7d', '30d', '90d'])) return finish(input, toolRange(f));",
"  if (hit(q, ['1048', '1047', 'pedido', 'despacho', 'envio'])) return finish(input, toolOrders(f));",
"  if (hit(q, ['stock', 'cap', 'invent', 'sku'])) return finish(input, toolStock(f));",
"  return null;",
"}",
])

# keep routeTools in KB
kb = src / "DigitalBoostPulseKB.ts"
if kb.is_file():
    k = kb.read_text(encoding="utf-8")
    if "routeTools" not in k:
        k = "import { routeTools } from './DigitalBoostPulseRouter';\n" + k
        k = k.replace(
            "if (q.indexOf(\"dataset\") !== -1 || q.indexOf(\"jsonl\") !== -1) {",
            "const routed = routeTools(input, q, finish);\n  if (routed) return routed;\n  if (q.indexOf(\"dataset\") !== -1 || q.indexOf(\"jsonl\") !== -1) {",
            1,
        )
        kb.write_text(k, encoding="utf-8")
        print("ok kb router")
    else:
        print("ya kb router")

print("LISTO ALL2")
