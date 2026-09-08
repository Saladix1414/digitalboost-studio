import { aiUsable } from "./DigitalBoostPulseBoost";

import { decide, explain, type PulseInput, type PulseDecision } from "./DigitalBoostPulseKB";
import { buildPulseContext, type PulseContext } from "./DigitalBoostPulseContext";
import DigitalBoostContextBuilder from "./context/DigitalBoostContextBuilder";
import DigitalBoostModelRegistry from "./ai/DigitalBoostModelRegistry";
import DigitalBoostModelRouter from "./ai/DigitalBoostModelRouter";
import DigitalBoostOpenClawBridge from "./openclaw/DigitalBoostOpenClawBridge";
export type { PulseInput, PulseDecision };
export type PulseBlock = { id: string; type: string; title: string; body: string; cta: string };
export { explain };
export function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
export function analyze(input: PulseInput): PulseDecision {
  return decide(input);
}
export async function analyzeSmart(input: PulseInput) {
  /*
   * PULSE sigue siendo el cerebro.
   *
   * Orden canónico:
   * 1. Rules Engine decide intent/risk/action/approval.
   * 2. Context Builder prepara contexto seguro.
   * 3. Model Router selecciona Qwen/Llama.
   * 4. OpenClaw ejecuta únicamente inferencia.
   * 5. El resultado IA se agrega a PULSE.
   *
   * La IA NO puede modificar confirm/risk/intent/action/card.
   */

  const decision = decide(input);
  try {
    const contextBuilder = new DigitalBoostContextBuilder();

    const context = contextBuilder.build({
      source: "pulse",
      riskLevel:
        decision.risk === "L3" || decision.risk === "L4"
          ? "high"
          : decision.risk === "L2"
            ? "medium"
            : "low",
      confidence: 1,
      permissions: ["inference"],
      store: {
        id: input.store,
      },
      pulse: {
        query: input.q || "",
        section: input.section,
        range: input.range,
        live: Boolean(input.live),
        page: input.page || "",
        blockCount: input.blockCount || 0,
        heroTitle: input.heroTitle || "",
        intent: decision.intent || "",
        risk: decision.risk || "",
      },
    });

    const bridge = new DigitalBoostOpenClawBridge();

    const status = await bridge.getStatus();

    if (!status.providerAvailable || !status.models.length) {
      return {
        decision: {
          ...decision,
          body:
            decision.body +
            "\n\nIA local no disponible. Arrancá Ollama (11434) y usá npm run dev. Mientras tanto responde el motor de reglas.",
        },
        engine: "rules" as const,
      };
    }

    const registry = new DigitalBoostModelRegistry();

    for (const modelName of status.models) {
      const normalized = String(modelName)
        .replace(/^ollama\//i, "")
        .trim();

      if (!normalized) continue;

      registry.registerOllamaModel(normalized, {
        fallbackPriority:
          /qwen/i.test(normalized) ? 10 : 20,
      });
    }

    /*
     * Especialización explícita:
     * - Qwen: contenido, SEO, productos, transformación.
     * - Llama: conversación y razonamiento.
     */
    const query = (input.q || "").toLowerCase();

    const reasoningIntent =
      /razon|analiz|explic|diagnost|por que|porqué|decid|estrateg|compar/.test(query);

    const capabilities = reasoningIntent
      ? ["reasoning", "conversation"] as const
      : ["content", "structured", "transformation"] as const;

    const router = new DigitalBoostModelRouter(registry);

    const selection = router.select({
      task: reasoningIntent ? "reasoning" : "content",
      capabilities: [...capabilities],
      preferredProvider: "ollama",
    });

    if (!selection.model) {
      return {
        decision,
        engine: "rules" as const,
      };
    }

    const prompt = [
      "Rol: socio de la tienda. Idioma: espanol rioplatense.",
      "Hechos:",
      "- tienda " + String(input.store || "Nimbus"),
      "- pagina " + String(input.page || "Inicio"),
      "- hero " + String(input.heroTitle || "sin titulo"),
      "Pedido: " + String(input.q || "hola"),
      "Escribe 4 oraciones. Propone. No apliques. No uses JSON.",
    ].join("\n");

    const ai = await bridge.runTask({
      task: reasoningIntent ? "analyze" : "reason",
      prompt,
      model:
        `${selection.model.provider}/${selection.model.modelId}`,
      context: context as unknown as Record<string, unknown>,
      risk:
        decision.risk === "L3" || decision.risk === "L4"
          ? "high"
          : decision.risk === "L2"
            ? "medium"
            : "low",
      requiresApproval: true,
    });

    if (!ai.accepted || ai.status === "failed" || !ai.result) {
      return {
        decision,
        engine: "rules" as const,
      };
    }

    const aiText =
      (function () {
        const a: any = ai;
        const t = a && (a.text || a.output || a.result);
        if (typeof t === "string" && t.trim()) return t.trim();
        const outs = a && a.outputs;
        if (Array.isArray(outs) && outs[0] && typeof outs[0].text === "string") return String(outs[0].text).trim();
        if (t && typeof t === "object") {
          if (typeof t.text === "string") return t.text.trim();
          if (Array.isArray(t.outputs) && t.outputs[0] && t.outputs[0].text) return String(t.outputs[0].text).trim();
        }
        try { return JSON.stringify(t || a || ""); } catch { return ""; }
      })();

    if (!aiText) {
      return {
        decision,
        engine: "rules" as const,
      };
    }

    /*
     * Seguridad:
     * El resultado IA NO reemplaza:
     * confirm
     * risk
     * intent
     * action
     * card
     *
     * Solo complementa la explicación de PULSE.
     */
    return {
      decision: {
        ...decision,
        body:
          aiText +
          "\n\n— " +
          selection.model.modelId +
          " · " +
          String(decision.action || "") +
          " · " +
          String(decision.risk || "L0"),
      },
      engine: (aiUsable(String((ai as any)?.text || (ai as any)?.output || "")) ? "openclaw" : "rules") as const,
      model: selection.model.modelId,
    };
  } catch {
    /*
     * Fallo de IA = fallback transparente a Rules Engine.
     * Nunca se bloquea PULSE por una dependencia opcional.
     */
    return {
      decision,
      engine: "rules" as const,
    };
  }
}
export function designApply(q: string, blocks: PulseBlock[]) {
  const s = (q || "").toLowerCase();
  const next = blocks.map(function (b) { return Object.assign({}, b); });
  if (s.indexOf("hero") !== -1 || s.indexOf("premium") !== -1 || s.indexOf("redisen") !== -1) {
    next.forEach(function (b) {
      if (b.type === "hero") { b.title = "La coleccion que no pide permiso."; b.body = "Menos texto. Un CTA."; b.cta = "Entrar"; }
    });
    return { note: "L1 Design: hero tocado. Reversible con History.", next: next };
  }
  return { note: "Proba hero / premium.", next: blocks };
}

export { buildPulseContext };


/**
 * Fase 1 — Context Builder canónico.
 *
 * Esta función es deliberadamente independiente de analyzeSmart():
 * permite que PULSE construya contexto antes de seleccionar
 * Rule Engine, Qwen2, Llama 3 u OpenClaw.
 */
export function buildContext(input: PulseInput): PulseContext {
  return buildPulseContext({
    store: input.store,
  });
}
