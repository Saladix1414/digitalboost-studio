/**
 * DigitalBoostPulseInference
 *
 * P0.7.2.0 — Inference Boundary Contract.
 *
 * Esta capa NO ejecuta proveedores.
 * Esta capa NO concede permisos.
 * Esta capa NO aprueba acciones.
 * Esta capa NO modifica Governance.
 *
 * Define:
 * - request canónico de inferencia;
 * - binding entre selección y modelo runtime;
 * - modos de salida;
 * - resultado normalizado;
 * - clasificación de fallos;
 * - provenance mínima.
 */

import type {
  OpenClawTaskResult,
} from "../openclaw/DigitalBoostOpenClawBridge";

export const PULSE_INFERENCE_CONTRACT =
  "p0.7.2.0" as const;

export type PulseInferenceOutputMode =
  | "TEXT"
  | "JSON";

export type PulseInferenceStatus =
  | "COMPLETED"
  | "FAILED";

export type PulseInferenceFailure =
  | "UNAVAILABLE"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "AUTHENTICATION"
  | "MODEL_NOT_FOUND"
  | "INVALID_REQUEST"
  | "CONTEXT_OVERFLOW"
  | "EMPTY_RESPONSE"
  | "INVALID_OUTPUT"
  | "MODEL_BINDING_MISMATCH"
  | "BRIDGE_REJECTED"
  | "BRIDGE_PROTOCOL_ERROR"
  | "UNKNOWN";

export interface PulseInferenceRequest {
  contract: typeof PULSE_INFERENCE_CONTRACT;

  requestId: string;

  modelRef: string;

  selectionFingerprint: string;

  task: string;

  prompt: string;

  context?: Record<string, unknown>;

  outputMode: PulseInferenceOutputMode;

  outputSchema?: unknown;

  timeoutMs?: number;

  tenantId?: string;

  store?: string;

  contextId?: string;

  contextVersion?: number;
}

export interface PulseInferenceProvenance {
  contract: typeof PULSE_INFERENCE_CONTRACT;

  requestId: string;

  modelRef: string;

  selectionFingerprint: string;

  provider: string;

  startedAt?: string;

  completedAt?: string;

  latencyMs?: number;
}

export interface PulseInferenceResult {
  contract: typeof PULSE_INFERENCE_CONTRACT;

  status: PulseInferenceStatus;

  requestId: string;

  modelRef: string;

  provider: string;

  selectionFingerprint: string;

  output?: unknown;

  outputMode: PulseInferenceOutputMode;

  failure?: PulseInferenceFailure;

  error?: string;

  latencyMs?: number;

  provenance: PulseInferenceProvenance;
}

export interface PulseInferenceBindingResult {
  valid: boolean;

  requestedModelRef: string;

  runtimeModelRef: string;

  error?: "MODEL_BINDING_MISMATCH";
}

export function assertPulseInferenceModelBinding(
  input: {
    requestedModelRef: string;
    runtimeModelRef: string;
  },
): PulseInferenceBindingResult {
  const requested =
    input.requestedModelRef.trim();

  const runtime =
    input.runtimeModelRef.trim();

  if (
    !requested ||
    !runtime ||
    requested !== runtime
  ) {
    return {
      valid: false,
      requestedModelRef: requested,
      runtimeModelRef: runtime,
      error:
        "MODEL_BINDING_MISMATCH",
    };
  }

  return {
    valid: true,
    requestedModelRef: requested,
    runtimeModelRef: runtime,
  };
}

export function extractPulseInferenceOutput(
  result: OpenClawTaskResult,
): unknown {
  if (
    !result ||
    result.status !== "completed"
  ) {
    return undefined;
  }

  if (
    result.result !== undefined &&
    result.result !== null
  ) {
    return result.result;
  }

  return undefined;
}

export function classifyPulseInferenceBridgeFailure(
  result: OpenClawTaskResult,
): PulseInferenceFailure {
  if (
    !result ||
    result.accepted === false
  ) {
    const message =
      String(
        result?.error || "",
      ).toLowerCase();

    if (
      /timeout|timed out|deadline/.test(
        message,
      )
    ) {
      return "TIMEOUT";
    }

    if (
      /rate limit|too many requests|throttl|ocupado/.test(
        message,
      )
    ) {
      return "RATE_LIMIT";
    }

    if (
      /model[_ -]*not[_ -]*found|unknown[_ -]*model|no local ollama model/.test(
        message,
      )
    ) {
      return "MODEL_NOT_FOUND";
    }

    if (
      /empty response|no response|blank response/.test(
        message,
      )
    ) {
      return "EMPTY_RESPONSE";
    }

    if (
      /unsupported|invalid request|prompt is required/.test(
        message,
      )
    ) {
      return "INVALID_REQUEST";
    }

    if (
      /unauthori[sz]ed|forbidden|credential|api key/.test(
        message,
      )
    ) {
      return "AUTHENTICATION";
    }

    return "BRIDGE_REJECTED";
  }

  switch (result.status) {
    case "completed":
      return "UNKNOWN";

    case "cancelled":
      return "BRIDGE_REJECTED";

    case "rejected":
      return "BRIDGE_REJECTED";

    case "awaiting_approval":
      return "BRIDGE_REJECTED";

    case "executing":
    case "proposed":
      return "BRIDGE_PROTOCOL_ERROR";

    case "failed":
      return "BRIDGE_REJECTED";

    default:
      return "UNKNOWN";
  }
}

export function normalizePulseInferenceResult(
  input: {
    request: PulseInferenceRequest;

    bridgeResult: OpenClawTaskResult;

    provider: string;

    runtimeModelRef: string;

    startedAt?: string;

    completedAt?: string;

    latencyMs?: number;
  },
): PulseInferenceResult {
  const provenance = {
    contract:
      PULSE_INFERENCE_CONTRACT,

    requestId:
      input.request.requestId,

    modelRef:
      input.request.modelRef,

    selectionFingerprint:
      input.request.selectionFingerprint,

    provider:
      input.provider,

    startedAt:
      input.startedAt,

    completedAt:
      input.completedAt,

    latencyMs:
      input.latencyMs,
  };

  /*
   * Runtime model binding is verified only when the runtime
   * claims that inference completed.
   *
   * A failed request may have no runtime model. In that case
   * the original failure class must remain observable.
   */
  if (
    input.bridgeResult.status ===
    "completed"
  ) {
    const binding =
      assertPulseInferenceModelBinding({
        requestedModelRef:
          input.request.modelRef,

        runtimeModelRef:
          input.runtimeModelRef,
      });

    if (!binding.valid) {
      return {
        contract:
          PULSE_INFERENCE_CONTRACT,

        status:
          "FAILED",

        requestId:
          input.request.requestId,

        modelRef:
          input.request.modelRef,

        provider:
          input.provider,

        selectionFingerprint:
          input.request.selectionFingerprint,

        outputMode:
          input.request.outputMode,

        failure:
          "MODEL_BINDING_MISMATCH",

        error:
          "Runtime model does not match selected model.",

        latencyMs:
          input.latencyMs,

        provenance,
      };
    }
  }

  const output =
    extractPulseInferenceOutput(
      input.bridgeResult,
    );

  if (
    input.bridgeResult.status ===
      "completed" &&
    output === undefined
  ) {
    return {
      contract:
        PULSE_INFERENCE_CONTRACT,

      status:
        "FAILED",

      requestId:
        input.request.requestId,

      modelRef:
        input.request.modelRef,

      provider:
        input.provider,

      selectionFingerprint:
        input.request.selectionFingerprint,

      outputMode:
        input.request.outputMode,

      failure:
        "EMPTY_RESPONSE",

      error:
        "Inference completed without usable output.",

      latencyMs:
        input.latencyMs,

      provenance,
    };
  }

  if (
    input.bridgeResult.status !==
    "completed"
  ) {
    return {
      contract:
        PULSE_INFERENCE_CONTRACT,

      status:
        "FAILED",

      requestId:
        input.request.requestId,

      modelRef:
        input.request.modelRef,

      provider:
        input.provider,

      selectionFingerprint:
        input.request.selectionFingerprint,

      outputMode:
        input.request.outputMode,

      failure:
        classifyPulseInferenceBridgeFailure(
          input.bridgeResult,
        ),

      error:
        input.bridgeResult.error,

      latencyMs:
        input.latencyMs,

      provenance,
    };
  }

  return {
    contract:
      PULSE_INFERENCE_CONTRACT,

    status:
      "COMPLETED",

    requestId:
      input.request.requestId,

    modelRef:
      input.request.modelRef,

    provider:
      input.provider,

    selectionFingerprint:
      input.request.selectionFingerprint,

    output,

    outputMode:
      input.request.outputMode,

    latencyMs:
      input.latencyMs,

    provenance,
  };
}
