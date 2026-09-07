#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime
import re

src = Path("src")
brain = src / "DigitalBoostPulseBrain.ts"
if not brain.is_file():
    raise SystemExit("Falta brain")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(brain, brain.with_name("DigitalBoostPulseBrain.before_visual_rebuild_" + stamp + ".ts"))

t = brain.read_text(encoding="utf-8")
fn = r"""
export async function analyzeSmart(input: PulseInput): Promise<{ decision: PulseDecision; engine: "ollama" | "rules" }> {
  const fallback = analyze(input);
  const urls = ["/ollama/api/chat", "http://127.0.0.1:11434/api/chat"];
  const system = "Sos PULSE, operador de DigitalBoost Commerce OS. SOLO JSON: title, body, action, actionLabel, confirm. action uno de: dashboard, orders, products, customers, analytics, campaigns, website-builder, inventory, settings, __health, __automations, __console, __notes, __integrations, __search. Voz corta rioplatense. confirm true solo para campana.";
  for (let u = 0; u < urls.length; u++) {
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 25000);
    try {
      const res = await fetch(urls[u], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          model: "llama3.2",
          stream: false,
          format: "json",
          messages: [
            { role: "system", content: system },
            { role: "user", content: "tienda=" + input.store + " rango=" + input.range + " seccion=" + input.section + " live=" + input.live + " pregunta=" + (input.q || "hola") }
          ]
        })
      });
      if (!res.ok) continue;
      const data = await res.json();
      const raw = String((data && data.message && data.message.content) || "");
      const a = raw.indexOf("{");
      const b = raw.lastIndexOf("}");
      if (a < 0 || b < 0) continue;
      const parsed = JSON.parse(raw.slice(a, b + 1));
      const allow = " dashboard orders products customers analytics campaigns website-builder inventory settings __health __automations __console __notes __integrations __search ";
      const action = String(parsed.action || fallback.action);
      if (allow.indexOf(" " + action + " ") === -1) continue;
      return {
        engine: "ollama",
        decision: {
          title: String(parsed.title || "PULSE").slice(0, 80),
          body: String(parsed.body || fallback.body).slice(0, 500),
          action: action,
          actionLabel: String(parsed.actionLabel || fallback.actionLabel).slice(0, 40),
          confirm: Boolean(parsed.confirm)
        }
      };
    } catch {
      continue;
    } finally {
      clearTimeout(timer);
    }
  }
  return { decision: fallback, engine: "rules" };
}
"""
t2, n = re.subn(
    r"export async function analyzeSmart\([\s\S]*?\n\}\n",
    fn + "\n",
    t,
    count=1,
)
if n == 0:
    t2 = t + "\n" + fn
    print("ok append smart")
else:
    print("ok replace smart")
brain.write_text(t2, encoding="utf-8")

vc = Path("vite.config.ts")
if not vc.is_file():
    vc = Path("vite.config.mts")
if vc.is_file():
    v = vc.read_text(encoding="utf-8")
    if "/ollama" not in v:
        shutil.copy2(vc, vc.with_suffix(vc.suffix + ".bak_" + stamp))
        if "server:" in v:
            v = v.replace("server: {", """server: {
    proxy: {
      "/ollama": {
        target: "http://127.0.0.1:11434",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\\/ollama/, ""),
      },
    },""", 1)
        elif "defineConfig(" in v:
            v = v.replace("defineConfig({", """defineConfig({
  server: {
    proxy: {
      "/ollama": {
        target: "http://127.0.0.1:11434",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\\/ollama/, ""),
      },
    },
  },""", 1)
        vc.write_text(v, encoding="utf-8")
        print("ok vite proxy")
    else:
        print("proxy ya estaba")
else:
    print("WARN no vite.config")
print("LISTO OLLAMA PROXY")
