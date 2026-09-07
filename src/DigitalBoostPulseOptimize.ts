import { seoFacts } from "./DigitalBoostPulseSeo";
import { toolInspect } from "./DigitalBoostPulseTools";
import type { PulseInput } from "./DigitalBoostPulseKB";

export function pulseOptimizeOnce(input?: PulseInput) {
  const facts = toolInspect(input);
  const seo = seoFacts();
  const proposals: Array<Record<string, unknown>> = [];

  if (facts.genericHero) {
    proposals.push({
      type: "hero",
      title: "La coleccion que no pide permiso.",
      body: "Una promesa. Un boton.",
      cta: "Entrar",
      reason: "Hero generico detectado por PULSE.",
    });
  }

  if (seo.top) {
    const page = seo.pages.find(function (item: any) {
      return item.id === seo.top.pageId || item.url === seo.top.url;
    });

    proposals.push({
      type: "seo-fix",
      fixKind: seo.top.fixKind,
      pageId: page ? page.id : seo.top.pageId,
      url: page ? page.url : seo.top.url,
      issueId: seo.top.id,
      reason: "PULSE propone corregir el problema SEO prioritario.",
    });
  }

  if (!proposals.length) {
    return {
      title: "PULSE",
      body: "Health " + seo.health + "/100. Limpio.",
      action: "seo",
      label: "Abrir SEO",
      proposal: null,
    };
  }

  return {
    title: "PULSE",
    body:
      "Tengo " +
      proposals.length +
      " optimizacion(es) propuesta(s). Revisalas antes de ejecutar.",
    action: "optimize",
    label: "Revisar propuestas",
    confirm: true,
    proposal: {
      type: "optimize",
      items: proposals,
    },
  };
}
