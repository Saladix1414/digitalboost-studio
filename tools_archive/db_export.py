#!/usr/bin/env python3
from pathlib import Path

p = Path("src/DigitalBoostPulseBrain.ts")
if not p.is_file():
    raise SystemExit("Falta DigitalBoostPulseBrain.ts")
t = p.read_text(encoding="utf-8")
if "export async function analyzeSmart" not in t:
    t += r"""

export async function analyzeSmart(input: PulseInput): Promise<{ decision: PulseDecision; engine: "ollama" | "rules" }> {
  const fallback = analyze(input);
  return { decision: fallback, engine: "rules" };
}
"""
    p.write_text(t, encoding="utf-8")
    print("ok append analyzeSmart")
else:
    print("ya estaba")
print("LISTO EXPORT")
