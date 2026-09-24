import {
  classifyIntent,
  type PulseIntent,
} from "./DigitalBoostPulseConst";

export const PULSE_INTENT_ENGINE_CONTRACT =
  "p0.5.1";

export const PULSE_INTENT_LABELS = [
  "information_general",
  "information_status",
  "help_usage",
  "navigation",
  "search",
  "recommendation_general",
  "analysis_general",
  "diagnosis",
  "optimization_general",
  "content_generation",
  "content_editing",
  "copywriting",
  "branding",
  "design_hero",
  "design_layout",
  "theme_customization",
  "cta_optimization",
  "seo_audit",
  "seo_fix",
  "seo_content",
  "seo_keywords",
  "seo_indexing",
  "analytics_sales",
  "analytics_conversion",
  "analytics_traffic",
  "analytics_customer",
  "reporting_briefing",
  "orders_status",
  "orders_fulfillment",
  "orders_shipping",
  "refund_request",
  "returns_request",
  "support_customer",
  "catalog_browse",
  "product_create",
  "product_edit",
  "product_publish",
  "inventory_status",
  "inventory_restock",
  "inventory_adjustment",
  "pricing_strategy",
  "pricing_update",
  "discount_campaign",
  "marketing_campaign",
  "promotion_create",
  "promotion_schedule",
  "supplier_search",
  "supplier_restock",
  "supplier_purchase",
  "automation_request",
  "integration_request",
  "system_health",
  "alerts",
  "planning",
  "prioritization",
  "experimentation",
  "forecasting",
  "finance_general",
  "access_request",
  "credential_access",
  "destructive_action",
  "unauthorized_action",
  "privacy_request",
  "data_export",
  "data_deletion",
  "publish_request",
  "deploy_request",
  "approval_request",
  "security_review",
  "audit_request",
  "competitor_research",
  "customer_feedback",
  "returns_policy",
  "store_setup",
  "product_recommendation",
  "seo_competitor",
  "unknown_request",
] as const;

export type PulseIntentLabel =
  (typeof PULSE_INTENT_LABELS)[number];

export type PulseIntentConfidence =
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type PulseIntentDecision =
  | "ALLOW_CLASSIFICATION"
  | "CLARIFY"
  | "BLOCK";

export type PulseIntentSecurityFlags = {
  dangerous: boolean;
  unauthorized: boolean;
  credentialSensitive: boolean;
  destructive: boolean;
};

export type PulseIntentCandidate = {
  label: PulseIntentLabel;
  score: number;
  matchedKeywords: string[];
};

export type PulseIntentClassification = {
  contractVersion:
    typeof PULSE_INTENT_ENGINE_CONTRACT;

  primary: PulseIntentLabel;

  secondary: PulseIntentLabel[];

  candidates: PulseIntentCandidate[];

  legacyIntent: PulseIntent;

  confidence: number;

  confidenceBand:
    PulseIntentConfidence;

  clarificationRequired: boolean;

  multiIntent: boolean;

  decision: PulseIntentDecision;

  authorizationRequired: boolean;

  security: PulseIntentSecurityFlags;

  normalizedQuery: string;

  matchedEvidence: string[];

  provenance: {
    engine: string;
    section?: string;
    store?: string;
    tenantId?: string;
    contextId?: string;
    contextVersion?: string;
  };
};

type IntentRule = {
  label: PulseIntentLabel;
  keywords: string[];
  weight?: number;
};

function fold(value: string): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeIntentText(
  value: string,
): string {
  return fold(value);
}

function hasAny(
  text: string,
  values: string[],
): boolean {
  return values.some(
    (value) =>
      text.includes(fold(value)),
  );
}

function rule(
  label: PulseIntentLabel,
  keywords: string[],
  weight = 1,
): IntentRule {
  return {
    label,
    keywords: keywords.map(fold),
    weight,
  };
}

const RULES: IntentRule[] = [
  rule("information_general", [
    "que es",
    "que significa",
    "informacion",
    "explicame",
    "quiero saber",
  ], 3),

  rule("information_status", [
    "estado",
    "como esta",
    "como va",
    "situacion",
  ], 3),

  rule("help_usage", [
    "como uso",
    "como funciona",
    "ayuda",
    "tutorial",
    "como hago",
  ], 3),

  rule("navigation", [
    "ir a",
    "abrir",
    "llevarme",
    "donde esta",
    "navegar",
  ], 3),

  rule("search", [
    "buscar",
    "busca",
    "encontrar",
    "search",
    "localizar",
  ], 3),

  rule("recommendation_general", [
    "recomenda",
    "recomiend",
    "suger",
    "que conviene",
    "que haria",
  ], 3),

  rule("analysis_general", [
    "analiza",
    "analizar",
    "analisis",
    "razona",
    "evaluar",
  ], 3),

  rule("diagnosis", [
    "diagnostico",
    "diagnosticar",
    "problema",
    "fallo",
    "por que falla",
  ], 3),

  rule("optimization_general", [
    "optimizar",
    "mejorar",
    "optimiza",
    "arreglar todo",
  ], 3),

  rule("content_generation", [
    "crear contenido",
    "genera contenido",
    "escribir contenido",
    "crear texto",
  ], 3),

  rule("content_editing", [
    "editar contenido",
    "corregir texto",
    "reescribir",
    "ajustar texto",
  ], 3),

  rule("copywriting", [
    "copy",
    "copywriting",
    "titular",
    "texto de venta",
    "descripcion comercial",
  ], 3),

  rule("branding", [
    "marca",
    "branding",
    "identidad",
    "voz de marca",
    "tono de marca",
  ], 3),

  rule("design_hero", [
    "hero",
    "portada",
    "homepage",
    "encabezado principal",
  ], 3),

  rule("design_layout", [
    "layout",
    "estructura",
    "bloques",
    "maquetacion",
    "distribucion",
  ], 3),

  rule("theme_customization", [
    "theme",
    "tema",
    "cambiar theme",
    "cambiar tema",
    "preset",
  ], 3),

  rule("cta_optimization", [
    "cta",
    "boton",
    "llamada a la accion",
    "conversion del boton",
  ], 3),

  rule("seo_audit", [
    "seo",
    "auditar seo",
    "auditoria seo",
    "seo audit",
  ], 3),

  rule("seo_fix", [
    "corregir seo",
    "seo fix",
    "arreglar seo",
    "optimizar seo",
  ], 3),

  rule("seo_content", [
    "meta title",
    "meta description",
    "descripcion seo",
    "titulo seo",
  ], 3),

  rule("seo_keywords", [
    "keyword",
    "keywords",
    "palabras clave",
    "intencion de busqueda",
  ], 3),

  rule("seo_indexing", [
    "indexar",
    "indexacion",
    "sitemap",
    "robots",
    "canonical",
  ], 3),

  rule("analytics_sales", [
    "ventas",
    "facturacion",
    "ingresos",
    "revenue",
  ], 3),

  rule("analytics_conversion", [
    "conversion",
    "conversión",
    "tasa de conversion",
    "conversion rate",
  ], 3),

  rule("analytics_traffic", [
    "trafico",
    "visitas",
    "sesiones",
    "usuarios",
  ], 3),

  rule("analytics_customer", [
    "clientes",
    "customer",
    "usuarios activos",
    "segmento de clientes",
  ], 3),

  rule("reporting_briefing", [
    "brief",
    "resumen",
    "reporte",
    "reporting",
  ], 3),

  rule("orders_status", [
    "pedido",
    "pedido pendiente",
    "estado del pedido",
    "orden",
  ], 3),

  rule("orders_fulfillment", [
    "despacho",
    "fulfillment",
    "preparar pedido",
    "preparacion del pedido",
  ], 3),

  rule("orders_shipping", [
    "envio",
    "entrega",
    "shipping",
    "despachar",
  ], 3),

  rule("refund_request", [
    "reembolso",
    "refund",
    "devolver dinero",
  ], 3),

  rule("returns_request", [
    "devolucion",
    "devolver producto",
    "return",
    "cambio de producto",
  ], 3),

  rule("support_customer", [
    "soporte",
    "atender cliente",
    "cliente enojado",
    "reclamo",
  ], 3),

  rule("catalog_browse", [
    "catalogo",
    "ver productos",
    "listar productos",
    "mostrar productos",
  ], 3),

  rule("product_create", [
    "crear producto",
    "nuevo producto",
    "agregar producto",
  ], 3),

  rule("product_edit", [
    "editar producto",
    "modificar producto",
    "cambiar producto",
  ], 3),

  rule("product_publish", [
    "publicar producto",
    "activar producto",
    "hacer visible producto",
  ], 3),

  rule("inventory_status", [
    "stock",
    "inventario",
    "existencias",
    "sku",
  ], 3),

  rule("inventory_restock", [
    "reponer stock",
    "reponer inventario",
    "restock",
  ], 3),

  rule("inventory_adjustment", [
    "ajustar stock",
    "corregir inventario",
    "movimiento de stock",
  ], 3),

  rule("pricing_strategy", [
    "estrategia de precio",
    "pricing",
    "precio ideal",
    "precio recomendado",
  ], 3),

  rule("pricing_update", [
    "cambiar precio",
    "actualizar precio",
    "subir precio",
    "bajar precio",
  ], 3),

  rule("discount_campaign", [
    "descuento",
    "cupon",
    "cupones",
    "oferta",
  ], 3),

  rule("marketing_campaign", [
    "campana",
    "campaña",
    "marketing",
    "promocion",
  ], 3),

  rule("promotion_create", [
    "crear promocion",
    "crear oferta",
    "crear descuento",
  ], 3),

  rule("promotion_schedule", [
    "programar promocion",
    "programar campaña",
    "agendar campaña",
  ], 3),

  rule("supplier_search", [
    "proveedor",
    "proveedores",
    "buscar proveedor",
  ], 3),

  rule("supplier_restock", [
    "reponer con proveedor",
    "abastecimiento",
    "reabastecimiento",
  ], 3),

  rule("supplier_purchase", [
    "comprar al proveedor",
    "orden de compra",
    "compra de proveedor",
  ], 3),

  rule("automation_request", [
    "automatizar",
    "automatizacion",
    "automatización",
    "crear automatizacion",
  ], 3),

  rule("integration_request", [
    "integrar",
    "integracion",
    "integración",
    "conectar servicio",
  ], 3),

  rule("system_health", [
    "health",
    "salud del sistema",
    "estado del sistema",
    "diagnostico tecnico",
  ], 3),

  rule("alerts", [
    "alerta",
    "alertas",
    "urgente",
    "aviso",
  ], 3),

  rule("planning", [
    "plan",
    "planificar",
    "planificacion",
    "pasos",
  ], 3),

  rule("prioritization", [
    "prioridad",
    "priorizar",
    "que hago primero",
    "prioridades",
  ], 3),

  rule("experimentation", [
    "experimento",
    "experimentar",
    "a/b",
    "ab test",
  ], 3),

  rule("forecasting", [
    "predecir",
    "pronostico",
    "forecast",
    "proyeccion",
  ], 3),

  rule("finance_general", [
    "finanzas",
    "margen",
    "costos",
    "cashflow",
  ], 3),

  rule("access_request", [
    "acceso",
    "dar acceso",
    "habilitar acceso",
    "permiso",
  ], 2),

  rule("credential_access", [
    "contraseña",
    "password",
    "api key",
    "token",
    "secreto",
    "private key",
    "credenciales",
  ], 4),

  rule("destructive_action", [
    "borrar",
    "eliminar",
    "destruir",
    "vaciar",
    "purge",
    "delete",
  ], 4),

  rule("unauthorized_action", [
    "sin permiso",
    "sin aprobacion",
    "sin aprobación",
    "saltate la aprobacion",
    "saltar aprobacion",
    "bypass",
    "eludir aprobacion",
    "cuenta ajena",
    "hackear",
  ], 5),

  rule("privacy_request", [
    "privacidad",
    "datos personales",
    "informacion personal",
  ], 3),

  rule("data_export", [
    "exportar datos",
    "exportacion",
    "exportación",
    "descargar datos",
  ], 3),

  rule("data_deletion", [
    "eliminar mis datos",
    "borrar mis datos",
    "borrar datos personales",
  ], 4),

  rule("publish_request", [
    "publicar",
    "publish",
    "lanzar",
  ], 3),

  rule("deploy_request", [
    "deploy",
    "desplegar",
    "despliegue",
    "poner en produccion",
  ], 3),

  rule("approval_request", [
    "aprobar",
    "aprobacion",
    "aprobación",
    "pedir aprobacion",
  ], 3),

  rule("security_review", [
    "seguridad",
    "revisar seguridad",
    "security review",
    "vulnerabilidad",
  ], 3),

  rule("audit_request", [
    "auditoria",
    "auditoría",
    "auditar",
    "evidencia",
    "trazabilidad",
  ], 3),

  rule("competitor_research", [
    "competencia",
    "competidores",
    "rival",
    "competitor",
  ], 3),

  rule("customer_feedback", [
    "feedback",
    "opinion de clientes",
    "comentarios de clientes",
    "reseñas",
  ], 3),

  rule("returns_policy", [
    "politica de devoluciones",
    "politica de cambios",
    "condiciones de devolucion",
  ], 3),

  rule("store_setup", [
    "crear tienda",
    "armar tienda",
    "configurar tienda",
    "configuracion inicial",
  ], 3),

  rule("product_recommendation", [
    "recomendar producto",
    "que producto vendo",
    "producto recomendado",
  ], 3),

  rule("seo_competitor", [
    "seo de competidores",
    "serp competidores",
    "keywords de la competencia",
  ], 3),

  rule("unknown_request", [], 1),
];

function legacyForLabel(
  label: PulseIntentLabel,
  fallback: PulseIntent,
): PulseIntent {
  switch (label) {
    case "refund_request":
    case "returns_request":
      return "refund";

    case "pricing_strategy":
    case "pricing_update":
      return "pricing";

    case "discount_campaign":
    case "marketing_campaign":
    case "promotion_create":
    case "promotion_schedule":
    case "seo_audit":
    case "seo_fix":
    case "seo_content":
    case "seo_keywords":
    case "seo_indexing":
    case "seo_competitor":
      return "marketing";

    case "inventory_status":
    case "inventory_restock":
    case "inventory_adjustment":
      return "inventory";

    case "orders_status":
    case "orders_fulfillment":
    case "orders_shipping":
      return "order";

    case "supplier_search":
    case "supplier_restock":
    case "supplier_purchase":
      return "supplier";

    case "catalog_browse":
    case "product_create":
    case "product_edit":
    case "product_publish":
      return "catalog";

    case "analytics_sales":
    case "analytics_conversion":
    case "analytics_traffic":
    case "analytics_customer":
    case "reporting_briefing":
    case "diagnosis":
      return "analysis";

    case "support_customer":
    case "customer_feedback":
      return "support";

    case "design_hero":
    case "design_layout":
    case "theme_customization":
    case "cta_optimization":
    case "content_generation":
    case "content_editing":
    case "copywriting":
    case "branding":
      return "content";

    case "search":
    case "competitor_research":
      return "search";

    case "recommendation_general":
    case "product_recommendation":
      return "recommendation";

    case "alerts":
    case "planning":
    case "prioritization":
    case "optimization_general":
    case "system_health":
    case "security_review":
      return "optimization";

    default:
      return fallback;
  }
}

function securityFlags(
  text: string,
): PulseIntentSecurityFlags {
  const credentialSensitive = hasAny(text, [
    "contraseña",
    "password",
    "api key",
    "token",
    "secreto",
    "private key",
    "credenciales",
  ]);

  const unauthorized = hasAny(text, [
    "sin permiso",
    "sin aprobacion",
    "sin aprobación",
    "saltate la aprobacion",
    "saltar aprobacion",
    "bypass",
    "eludir aprobacion",
    "cuenta ajena",
    "hackear",
  ]);

  const destructive = hasAny(text, [
    "borrar",
    "eliminar",
    "destruir",
    "vaciar",
    "purge",
    "delete",
  ]);

  return {
    credentialSensitive,
    unauthorized,
    destructive,
    dangerous:
      credentialSensitive ||
      unauthorized ||
      destructive,
  };
}

function hasMultiIntentConnector(
  text: string,
): boolean {
  return /(?:^| )y(?: |$)|ademas|tambien|luego|despues|;/.test(
    text,
  );
}


const INTENT_SPECIFICITY_OVERRIDES: Array<{
  label: PulseIntentLabel;
  phrases: string[];
}> = [
  {
    label: "analytics_traffic",
    phrases: [
      "analizar trafico",
      "analiza el trafico",
      "analizar el trafico",
      "revisar trafico",
      "revisar el trafico",
      "analisis de trafico",
      "analisis del trafico",
      "trafico del sitio",
      "trafico web",
    ],
  },

  {
    label: "seo_fix",
    phrases: [
      "corregir seo",
      "arreglar seo",
      "solucionar seo",
      "mejorar seo tecnico",
      "fix seo",
    ],
  },

  {
    label: "cta_optimization",
    phrases: [
      "optimizar cta",
      "optimizar el cta",
      "mejorar cta",
      "mejorar el cta",
      "revisar cta",
      "revisar el cta",
    ],
  },

  {
    label: "pricing_strategy",
    phrases: [
      "que precio me conviene",
      "que precio conviene",
      "que precio deberia poner",
      "que precio debería poner",
      "como fijar precio",
      "como fijar precios",
      "estrategia de precio",
      "estrategia de precios",
      "precio recomendado",
    ],
  },

  {
    label: "promotion_schedule",
    phrases: [
      "programar promocion",
      "programar una promocion",
      "programar promo",
      "agendar promocion",
      "agendar una promocion",
      "programar descuento",
    ],
  },

  {
    label: "supplier_search",
    phrases: [
      "buscar proveedor",
      "buscar proveedores",
      "buscar un proveedor",
      "encontrar proveedor",
      "encontrar proveedores",
      "encontrar un proveedor",
    ],
  },
];

function resolveSpecificIntentMatch(
  normalizedQuery: string,
): {
  label: PulseIntentLabel;
  phrase: string;
} | undefined {
  for (
    const override of
    INTENT_SPECIFICITY_OVERRIDES
  ) {
    const phrase =
      override.phrases.find(
        (candidatePhrase) =>
          normalizedQuery.includes(
            candidatePhrase,
          ),
      );

    if (phrase) {
      return {
        label: override.label,
        phrase,
      };
    }
  }

  return undefined;
}

function resolveSpecificIntent(
  normalizedQuery: string,
): PulseIntentLabel | undefined {
  return resolveSpecificIntentMatch(
    normalizedQuery,
  )?.label;
}

export function classifyPulseIntent(
  input: {
    q: string;
    section?: string;
    store?: string;
    tenantId?: string;
    contextId?: string;
    contextVersion?: string;
  },
): PulseIntentClassification {
  const normalizedQuery =
    normalizeIntentText(
      input.q,
    );

  const specificityMatch =
    resolveSpecificIntentMatch(
      normalizedQuery,
    );

  const specificityOverride =
    specificityMatch?.label;

  const security =
    securityFlags(
      normalizedQuery,
    );

  const legacyIntent =
    classifyIntent(
      input.q,
      input.section || "",
    );

  let candidates: PulseIntentCandidate[] =
    RULES
      .map((candidateRule) => {
        let score = 0;
        const matchedKeywords: string[] = [];

        for (const keyword of candidateRule.keywords) {
          if (
            normalizedQuery.includes(
              keyword,
            )
          ) {
            score +=
              candidateRule.weight || 1;
            matchedKeywords.push(
              keyword,
            );
          }
        }

        return {
          label:
            candidateRule.label,
          score,
          matchedKeywords,
        };
      })
      .filter(
        (candidate) =>
          candidate.score > 0,
      )
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.label.localeCompare(
            b.label,
          ),
      );

  /*
   * Specificity precedence is applied BEFORE best,
   * confidence, ambiguity and decision are calculated.
   *
   * This keeps the complete classifier state coherent:
   * primary === best.label === evidence owner.
   */
  if (specificityMatch) {
    const currentMaxScore =
      candidates[0]?.score || 0;

    const minimumSpecificScore =
      Math.max(
        5,
        currentMaxScore + 1,
      );

    const existingIndex =
      candidates.findIndex(
        (candidate) =>
          candidate.label ===
          specificityMatch.label,
      );

    if (existingIndex >= 0) {
      const existing =
        candidates[existingIndex];

      candidates[existingIndex] = {
        ...existing,
        score:
          Math.max(
            existing.score,
            minimumSpecificScore,
          ),
        matchedKeywords: [
          ...new Set([
            ...existing.matchedKeywords,
            specificityMatch.phrase,
          ]),
        ],
      };
    } else {
      candidates.push({
        label:
          specificityMatch.label,
        score:
          minimumSpecificScore,
        matchedKeywords: [
          specificityMatch.phrase,
        ],
      });
    }

    candidates.sort(
      (a, b) =>
        b.score - a.score ||
        a.label.localeCompare(
          b.label,
        ),
    );
  }

  const fallback =
    candidates[0]?.label ||
    "unknown_request";

  const best =
    candidates[0] || {
      label: fallback,
      score: 0,
      matchedKeywords: [],
    };

  const second =
    candidates[1];

  const rawConfidence =
    best.score >= 5
      ? 0.98
      : best.score >= 3
        ? 0.91
        : best.score >= 2
          ? 0.78
          : best.score >= 1
            ? 0.58
            : 0.25;

  const margin =
    second && best.score > 0
      ? Math.max(
          0,
          (best.score -
            second.score) /
            best.score,
        )
      : 1;

  const confidence = Math.min(
    0.99,
    Math.max(
      0.1,
      rawConfidence +
        margin * 0.05,
    ),
  );

  const multiIntent =
    Boolean(second) &&
    second.score >=
      Math.max(
        2,
        best.score * 0.6,
      ) &&
    hasMultiIntentConnector(
      normalizedQuery,
    );

  const ambiguity =
    confidence < 0.7 ||
    Boolean(
      second &&
        best.score ===
          second.score,
    );

  const clarificationRequired =
    ambiguity ||
    multiIntent;

  let decision:
    PulseIntentDecision =
    clarificationRequired
      ? "CLARIFY"
      : "ALLOW_CLASSIFICATION";

  if (
    security.unauthorized ||
    security.credentialSensitive
  ) {
    decision = "BLOCK";
  }

  if (
    security.destructive &&
    decision !== "BLOCK"
  ) {
    decision = "CLARIFY";
  }

  const primary =
    best.label;

  const secondary =
    candidates
      .slice(1, 4)
      .map(
        (candidate) =>
          candidate.label,
      );

  const authorizationRequired =
    security.destructive ||
    security.credentialSensitive ||
    security.unauthorized ||
    [
      "refund_request",
      "pricing_update",
      "promotion_create",
      "promotion_schedule",
      "product_publish",
      "publish_request",
      "deploy_request",
      "data_deletion",
    ].includes(
      primary,
    );

  const matchedEvidence =
    primary === "unknown_request"
      ? []
      : candidates
          .slice(0, 3)
          .flatMap(
            (candidate) => [
              `intent:${candidate.label}`,
              ...candidate.matchedKeywords.map(
                (keyword) =>
                  `keyword:${keyword}`,
              ),
            ],
          );

  return {
    contractVersion:
      PULSE_INTENT_ENGINE_CONTRACT,

    primary,

    secondary,

    candidates:
      candidates.slice(0, 8),

    legacyIntent:
      legacyForLabel(
        primary,
        legacyIntent,
      ),

    confidence,

    confidenceBand:
      confidence >= 0.85
        ? "HIGH"
        : confidence >= 0.65
          ? "MEDIUM"
          : "LOW",

    clarificationRequired,

    multiIntent,

    decision,

    authorizationRequired,

    security,

    normalizedQuery,

    matchedEvidence: [
      ...new Set(
        matchedEvidence,
      ),
    ],

    provenance: {
      engine:
        PULSE_INTENT_ENGINE_CONTRACT,
      section:
        input.section,
      store:
        input.store,
      tenantId:
        input.tenantId,
      contextId:
        input.contextId,
      contextVersion:
        input.contextVersion,
    },
  };
}
