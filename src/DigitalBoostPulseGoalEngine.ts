import {
  hashProposal,
} from "./DigitalBoostPulseContracts";

import {
  classifyPulseIntent,
  type PulseIntentClassification,
  type PulseIntentLabel,
} from "./DigitalBoostPulseIntentEngine";

export const PULSE_GOAL_ENGINE_CONTRACT =
  "p0.5.2";

export type PulseGoalPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type PulseGoalDecision =
  | "ALLOW_GOAL"
  | "CLARIFY"
  | "BLOCK";

export type PulseGoalProvenance = {
  engine: string;
  source: "merchant" | "cycle" | "derived";
  tenantId?: string;
  store?: string;
  section?: string;
  contextId?: string;
  contextVersion?: string;
  intent: PulseIntentLabel;
  intentConfidence: number;
  intentDecision: string;
};

export type PulseGoalEvidenceRequirements = {
  required: string[];
  prohibited: string[];
};

export type PulseGoalCandidate = {
  id: string;
  statement: string;
  desiredOutcome: string;
  priority: PulseGoalPriority;
  riskFloor: string;
  score: number;
};

export type PulseGoalEngineGoal = {
  id: string;
  statement: string;
  desiredOutcome: string;
  constraints: string[];
  successCriteria: string[];
  riskFloor: string;
  priority: PulseGoalPriority;
  intent: PulseIntentLabel;
  intentConfidence: number;
  tenantId?: string;
  store?: string;
  section?: string;
  contextId?: string;
  contextVersion?: string;
  evidenceRequirements: PulseGoalEvidenceRequirements;
  provenance: PulseGoalProvenance;
  fingerprint: string;
};

export type PulseGoalClassification = {
  contractVersion: typeof PULSE_GOAL_ENGINE_CONTRACT;
  decision: PulseGoalDecision;
  clarificationRequired: boolean;
  authorizationRequired: boolean;
  goal: PulseGoalEngineGoal;
  candidates: PulseGoalCandidate[];
};

const BASE_CONSTRAINTS = [
  "governance-first",
  "no-invented-metrics",
  "verify-after-write",
];

const BASE_SUCCESS_CRITERIA = [
  "policy-evaluated",
  "expected-outcome-declared",
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function priorityForIntent(
  intent: PulseIntentLabel,
): PulseGoalPriority {
  switch (intent) {
    case "destructive_action":
    case "credential_access":
    case "unauthorized_action":
    case "deploy_request":
    case "data_deletion":
      return "CRITICAL";

    case "refund_request":
    case "pricing_update":
    case "promotion_schedule":
    case "product_publish":
    case "publish_request":
    case "supplier_purchase":
    case "automation_request":
    case "integration_request":
      return "HIGH";

    case "analytics_sales":
    case "analytics_conversion":
    case "analytics_traffic":
    case "analytics_customer":
    case "diagnosis":
    case "forecasting":
    case "security_review":
    case "audit_request":
      return "MEDIUM";

    default:
      return "LOW";
  }
}

function riskForIntent(
  intent: PulseIntentLabel,
): string {
  switch (intent) {
    case "destructive_action":
    case "credential_access":
    case "unauthorized_action":
    case "deploy_request":
    case "data_deletion":
      return "L4";

    case "refund_request":
    case "supplier_purchase":
    case "promotion_schedule":
    case "promotion_create":
    case "discount_campaign":
    case "publish_request":
    case "product_publish":
      return "L3";

    case "pricing_update":
    case "inventory_adjustment":
    case "automation_request":
    case "integration_request":
      return "L2";

    case "content_generation":
    case "content_editing":
    case "design_hero":
    case "design_layout":
    case "theme_customization":
    case "cta_optimization":
    case "seo_fix":
      return "L1";

    default:
      return "L0";
  }
}

function desiredOutcomeForIntent(
  intent: PulseIntentLabel,
): string {
  switch (intent) {
    case "analytics_sales":
      return "Obtener una lectura verificable del rendimiento de ventas.";

    case "analytics_conversion":
      return "Identificar el estado y los factores verificables de conversión.";

    case "analytics_traffic":
      return "Obtener una lectura verificable del tráfico y sus señales principales.";

    case "analytics_customer":
      return "Obtener una lectura verificable del comportamiento de clientes.";

    case "seo_audit":
      return "Identificar hallazgos SEO verificables sin inventar métricas.";

    case "seo_fix":
      return "Corregir el problema SEO priorizado de forma verificable y reversible.";

    case "seo_keywords":
      return "Identificar oportunidades de keywords respaldadas por evidencia disponible.";

    case "seo_indexing":
      return "Verificar y mejorar el estado de indexación sin asumir resultados inexistentes.";

    case "design_hero":
      return "Mejorar el hero mediante un cambio reversible y verificable.";

    case "design_layout":
      return "Mejorar la estructura visual mediante cambios reversibles y verificables.";

    case "theme_customization":
      return "Ajustar el theme preservando reversibilidad y trazabilidad.";

    case "cta_optimization":
      return "Mejorar el CTA mediante una modificación verificable.";

    case "inventory_status":
      return "Obtener el estado verificable del inventario.";

    case "inventory_restock":
      return "Definir una reposición de inventario respaldada por evidencia.";

    case "pricing_strategy":
      return "Determinar una estrategia de precios sustentada por contexto y evidencia.";

    case "pricing_update":
      return "Actualizar precios únicamente dentro de una propuesta autorizada y verificable.";

    case "marketing_campaign":
      return "Definir una campaña de marketing dentro de los límites de gobernanza.";

    case "promotion_schedule":
      return "Programar una promoción únicamente con autorización y trazabilidad.";

    case "supplier_search":
      return "Identificar proveedores relevantes con evidencia disponible.";

    case "supplier_purchase":
      return "Preparar una compra a proveedor dentro de los controles de autorización.";

    case "refund_request":
      return "Resolver la solicitud de reembolso dentro de las reglas aplicables.";

    case "orders_status":
    case "orders_fulfillment":
    case "orders_shipping":
      return "Obtener o resolver el estado operativo verificable del pedido.";

    case "automation_request":
      return "Definir una automatización explícita, controlada y verificable.";

    case "integration_request":
      return "Definir una integración con límites, permisos y verificación explícitos.";

    case "system_health":
      return "Determinar el estado operativo verificable del sistema.";

    case "alerts":
      return "Identificar y priorizar alertas verificables.";

    case "planning":
      return "Convertir la petición en un objetivo operativo claro y verificable.";

    case "experimentation":
      return "Definir un experimento controlado con criterio de éxito explícito.";

    case "forecasting":
      return "Construir una proyección basada en evidencia disponible y supuestos explícitos.";

    case "security_review":
      return "Identificar riesgos de seguridad verificables sin ejecutar cambios no autorizados.";

    case "audit_request":
      return "Producir una revisión trazable basada en evidencia.";

    case "competitor_research":
    case "seo_competitor":
      return "Obtener información verificable sobre competidores sin inventar datos.";

    case "customer_feedback":
      return "Consolidar feedback verificable de clientes.";

    case "returns_policy":
      return "Definir o revisar una política de devoluciones clara y verificable.";

    case "store_setup":
      return "Definir la configuración requerida de la tienda dentro de contrato.";

    case "product_create":
      return "Preparar la creación del producto con atributos y resultado esperado verificables.";

    case "product_edit":
      return "Preparar una modificación de producto reversible y verificable.";

    case "product_publish":
      return "Publicar el producto únicamente con autorización y verificación.";

    case "destructive_action":
      return "Identificar y controlar una acción destructiva antes de cualquier ejecución.";

    case "credential_access":
      return "Impedir la exposición o uso no autorizado de credenciales.";

    case "unauthorized_action":
      return "Impedir una acción que no cuenta con autorización válida.";

    case "privacy_request":
      return "Resolver la petición de privacidad dentro de los controles aplicables.";

    case "data_export":
      return "Preparar una exportación de datos controlada y trazable.";

    case "data_deletion":
      return "Gestionar una eliminación de datos únicamente con autorización y evidencia.";

    case "publish_request":
      return "Preparar una publicación dentro de los controles de gobernanza.";

    case "deploy_request":
      return "Preparar un despliegue únicamente con autorización y controles de seguridad.";

    case "approval_request":
      return "Obtener una decisión de aprobación explícita y trazable.";

    default:
      return "Convertir la petición en un resultado explícito, verificable y gobernado.";
  }
}

function statementForIntent(
  intent: PulseIntentLabel,
  desiredOutcome: string,
): string {
  switch (intent) {
    case "destructive_action":
      return "Controlar la acción destructiva solicitada sin ejecutarla fuera de contrato.";

    case "credential_access":
      return "Proteger las credenciales y bloquear cualquier exposición no autorizada.";

    case "unauthorized_action":
      return "Bloquear la operación no autorizada y preservar la gobernanza.";

    case "refund_request":
      return "Gestionar la solicitud de reembolso respetando autorización y trazabilidad.";

    default:
      return desiredOutcome;
  }
}

function evidenceRequirementsForIntent(
  intent: PulseIntentLabel,
): PulseGoalEvidenceRequirements {
  const required = [
    "intent-classified",
    "goal-declared",
    "policy-evaluated",
    "expected-outcome-declared",
  ];

  const prohibited = [
    "invented-metrics",
    "unverified-completion",
    "unauthorized-execution",
  ];

  switch (intent) {
    case "analytics_sales":
    case "analytics_conversion":
    case "analytics_traffic":
    case "analytics_customer":
    case "forecasting":
      required.push("source-evidence");
      break;

    case "pricing_update":
    case "promotion_schedule":
    case "product_publish":
    case "publish_request":
    case "deploy_request":
    case "refund_request":
      required.push("approval-evidence");
      break;

    case "destructive_action":
    case "credential_access":
    case "unauthorized_action":
    case "data_deletion":
      required.push("authorization-boundary");
      break;

    default:
      break;
  }

  return {
    required,
    prohibited,
  };
}

function goalId(input: {
  normalizedQuery: string;
  intent: PulseIntentLabel;
  action?: string;
  tenantId?: string;
  store?: string;
  section?: string;
  contextVersion?: string;
}): string {
  return (
    "goal_" +
    hashProposal({
      normalizedQuery: input.normalizedQuery,
      intent: input.intent,
      action: input.action || "",
      tenantId: input.tenantId || "",
      store: input.store || "",
      section: input.section || "",
      contextVersion: input.contextVersion || "",
    }).slice(0, 20)
  );
}

export type PulseGoalFingerprintInput = {
  id: string;
  statement: string;
  desiredOutcome?: string;
  constraints: string[];
  successCriteria: string[];
  riskFloor: string;
  priority?: string;
  intent?: string;
  intentConfidence?: number;
  tenantId?: string;
  store?: string;
  section?: string;
  contextId?: string;
  contextVersion?: string;
  evidenceRequirements?: {
    required: string[];
    prohibited: string[];
  };
  provenance?: {
    engine: string;
    source: string;
    tenantId?: string;
    store?: string;
    section?: string;
    contextId?: string;
    contextVersion?: string;
    intent: string;
    intentConfidence: number;
    intentDecision: string;
  };
};

export function fingerprintPulseGoalEngineGoal(
  goal: PulseGoalFingerprintInput,
): string {
  return hashProposal({
    id: goal.id,
    statement: goal.statement,
    desiredOutcome:
      goal.desiredOutcome || "",
    constraints: [
      ...goal.constraints,
    ],
    successCriteria: [
      ...goal.successCriteria,
    ],
    riskFloor:
      goal.riskFloor,
    priority:
      goal.priority || "",
    intent:
      goal.intent || "",
    intentConfidence:
      goal.intentConfidence ?? 0,
    tenantId:
      goal.tenantId || "",
    store:
      goal.store || "",
    section:
      goal.section || "",
    contextId:
      goal.contextId || "",
    contextVersion:
      goal.contextVersion || "",
    evidenceRequirements: {
      required: [
        ...(goal.evidenceRequirements?.required || []),
      ],
      prohibited: [
        ...(goal.evidenceRequirements?.prohibited || []),
      ],
    },
    provenance: goal.provenance
      ? {
          engine:
            goal.provenance.engine,
          source:
            goal.provenance.source,
          tenantId:
            goal.provenance.tenantId || "",
          store:
            goal.provenance.store || "",
          section:
            goal.provenance.section || "",
          contextId:
            goal.provenance.contextId || "",
          contextVersion:
            goal.provenance.contextVersion || "",
          intent:
            goal.provenance.intent,
          intentConfidence:
            goal.provenance.intentConfidence,
          intentDecision:
            goal.provenance.intentDecision,
        }
      : null,
  });
}

export function buildPulseGoal(
  input: {
    q: string;
    action?: string;
    section?: string;
    store?: string;
    tenantId?: string;
    contextId?: string;
    contextVersion?: string;
    intentClassification?: PulseIntentClassification;
  },
): PulseGoalClassification {
  const normalizedQuery =
    normalize(input.q);

  const classification =
    input.intentClassification ||
    classifyPulseIntent({
      q: input.q,
      section: input.section,
      store: input.store,
      tenantId:
        input.tenantId || input.store,
      contextId: input.contextId,
      contextVersion:
        input.contextVersion,
    });

  const intent =
    classification.primary;

  const desiredOutcome =
    desiredOutcomeForIntent(intent);

  const statement =
    statementForIntent(
      intent,
      desiredOutcome,
    );

  const priority =
    priorityForIntent(intent);

  const riskFloor =
    riskForIntent(intent);

  const evidenceRequirements =
    evidenceRequirementsForIntent(
      intent,
    );

  /*
   * Goal Engine is a fail-closed boundary.
   *
   * A goal must never become executable merely because the
   * upstream classifier failed to propagate a security decision.
   */
  const security =
    classification.security;

  const decision: PulseGoalDecision =
    classification.decision === "BLOCK" ||
    security.unauthorized ||
    security.credentialSensitive
      ? "BLOCK"
      : classification.decision === "CLARIFY" ||
          classification.clarificationRequired ||
          security.destructive
        ? "CLARIFY"
        : "ALLOW_GOAL";

  const authorizationRequired =
    classification.authorizationRequired ||
    security.destructive ||
    security.credentialSensitive ||
    security.unauthorized ||
    riskFloor === "L3" ||
    riskFloor === "L4";

  const id =
    goalId({
      normalizedQuery,
      intent,
      action: input.action,
      tenantId:
        input.tenantId ||
        input.store,
      store: input.store,
      section: input.section,
      contextVersion:
        input.contextVersion,
    });

  const provenance: PulseGoalProvenance = {
    engine:
      PULSE_GOAL_ENGINE_CONTRACT,
    source:
      input.intentClassification
        ? "cycle"
        : "derived",
    tenantId:
      input.tenantId ||
      input.store,
    store:
      input.store,
    section:
      input.section,
    contextId:
      input.contextId,
    contextVersion:
      input.contextVersion,
    intent,
    intentConfidence:
      classification.confidence,
    intentDecision:
      classification.decision,
  };

  const provisional: Omit<
    PulseGoalEngineGoal,
    "fingerprint"
  > = {
    id,
    statement,
    desiredOutcome,
    constraints: [
      ...BASE_CONSTRAINTS,
    ],
    successCriteria: [
      ...BASE_SUCCESS_CRITERIA,
    ],
    riskFloor,
    priority,
    intent,
    intentConfidence:
      classification.confidence,
    tenantId:
      input.tenantId ||
      input.store,
    store:
      input.store,
    section:
      input.section,
    contextId:
      input.contextId,
    contextVersion:
      input.contextVersion,
    evidenceRequirements,
    provenance,
  };

  const goal: PulseGoalEngineGoal = {
    ...provisional,
    fingerprint:
      fingerprintPulseGoalEngineGoal({
        ...provisional,
        fingerprint: "",
      }),
  };

  const candidate: PulseGoalCandidate = {
    id: goal.id,
    statement: goal.statement,
    desiredOutcome:
      goal.desiredOutcome,
    priority: goal.priority,
    riskFloor: goal.riskFloor,
    score:
      classification.confidence,
  };

  return {
    contractVersion:
      PULSE_GOAL_ENGINE_CONTRACT,
    decision,
    clarificationRequired:
      decision === "CLARIFY",
    authorizationRequired,
    goal,
    candidates: [candidate],
  };
}
