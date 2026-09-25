/**
 * DigitalBoostPulseInferenceRuntime
 *
 * P0.7.2.3 — Model Identity & Runtime Binding.
 *
 * Separates:
 *
 *   selectionModelRef
 *        ↓
 *   runtimeModelRef
 *
 * Runtime execution is permitted only when a verified
 * PulseModelRuntimeBinding exists.
 */

import type {
  OpenClawTaskRequest,
  OpenClawTaskResult,
} from "../openclaw/DigitalBoostOpenClawBridge";

import DigitalBoostOpenClawBridge from
  "../openclaw/DigitalBoostOpenClawBridge";

import {
  PULSE_INFERENCE_CONTRACT,
  normalizePulseInferenceResult,
  type PulseInferenceRequest,
  type PulseInferenceResult,
  type PulseInferenceOutputMode,
} from "./DigitalBoostPulseInference";

import type {
  PulseModelSelectionContract,
} from "./DigitalBoostModelIntelligence";

import {
  validatePulseModelRuntimeBinding,
} from "./DigitalBoostModelRuntimeBinding";

export const PULSE_RUNTIME_INFERENCE_CONTRACT =
  "p0.7.2.2" as const;

export interface PulseInferenceRuntimeBridge {
  runTask(
    request: OpenClawTaskRequest,
  ): Promise<OpenClawTaskResult>;
}

export type PulseInferenceRuntimeRequest =
  Omit<
    PulseInferenceRequest,
    | "contract"
    | "modelRef"
    | "expectedRuntimeModelRef"
    | "selectionFingerprint"
  >;

export interface ExecutePulseInferenceInput {
  selection:
    PulseModelSelectionContract;

  request:
    PulseInferenceRuntimeRequest;

  bridge?:
    PulseInferenceRuntimeBridge;
}

function mapRisk(
  risk:
    PulseModelSelectionContract[
      "taskProfile"
    ]["risk"],
):
  "low" |
  "medium" |
  "high" {
  switch (risk) {
    case "L0":
    case "L1":
      return "low";

    case "L2":
      return "medium";

    case "L3":
    case "L4":
      return "high";
  }
}

function getSelectedModelRef(
  selection:
    PulseModelSelectionContract,
): string {
  const model =
    selection.rawSelection.model;

  if (!model) return "";

  return (
    `${model.provider}/${model.modelId}`
  );
}

function buildFailedResult(
  request:
    PulseInferenceRuntimeRequest,

  modelRef:
    string,

  selectionFingerprint:
    string,

  failure:
    | "INVALID_REQUEST"
    | "MODEL_BINDING_MISMATCH"
    | "MODEL_RUNTIME_BINDING_UNAVAILABLE",

  error:
    string,
):
  PulseInferenceResult {
  const now =
    new Date().toISOString();

  return {
    contract:
      PULSE_INFERENCE_CONTRACT,

    status:
      "FAILED",

    requestId:
      request.requestId,

    modelRef,

    runtimeModelRef:
      undefined,

    provider:
      "openclaw",

    selectionFingerprint,

    outputMode:
      request.outputMode,

    failure,

    error,

    latencyMs:
      0,

    provenance: {
      contract:
        PULSE_INFERENCE_CONTRACT,

      requestId:
        request.requestId,

      modelRef,

      selectionFingerprint,

      provider:
        "openclaw",

      startedAt:
        now,

      completedAt:
        now,

      latencyMs:
        0,
    },
  };
}

export async function executePulseInference(
  input:
    ExecutePulseInferenceInput,
):
  Promise<PulseInferenceResult> {
  const {
    selection,
    request,
  } = input;

  const modelRef =
    getSelectedModelRef(
      selection,
    );

  const fingerprint =
    selection.fingerprint;

  /*
   * The runtime binding is now a first-class security
   * boundary.
   *
   * Without a valid binding, PULSE must not execute.
   */
  const runtimeBinding =
    selection.runtimeBinding;

  const runtimeBindingValidation =
    validatePulseModelRuntimeBinding(
      runtimeBinding,
    );

  if (
    !runtimeBinding ||
    !runtimeBindingValidation.valid ||
    runtimeBinding.mode ===
      "UNBOUND" ||
    !runtimeBinding.runtimeModelRef
  ) {
    return buildFailedResult(
      request,

      modelRef,

      fingerprint,

      "MODEL_RUNTIME_BINDING_UNAVAILABLE",

      "No verified runtime model binding is available for the selected model.",
    );
  }

  if (
    !selection.rawSelection.model ||
    selection.evidence.decision ===
      "BLOCK_MODEL" ||
    selection.evidence.decision ===
      "USE_RULES"
  ) {
    return buildFailedResult(
      request,

      modelRef,

      fingerprint,

      "INVALID_REQUEST",

      "No executable model selection is available for runtime inference.",
    );
  }

  /*
   * Selection evidence and runtime binding must agree.
   */
  if (
    selection.evidence.selectedModelRef !==
    modelRef
  ) {
    return buildFailedResult(
      request,

      modelRef,

      fingerprint,

      "MODEL_BINDING_MISMATCH",

      "Selection evidence does not match the selected model.",
    );
  }

  if (
    runtimeBinding.selectionModelRef !==
    modelRef
  ) {
    return buildFailedResult(
      request,

      modelRef,

      fingerprint,

      "MODEL_BINDING_MISMATCH",

      "Runtime binding does not match the selected model.",
    );
  }

  const expectedRuntimeModelRef =
    runtimeBinding.runtimeModelRef;

  const runtimeRequest:
    PulseInferenceRequest = {
    contract:
      PULSE_INFERENCE_CONTRACT,

    requestId:
      request.requestId,

    modelRef,

    expectedRuntimeModelRef,

    selectionFingerprint:
      fingerprint,

    task:
      request.task,

    prompt:
      request.prompt,

    context:
      request.context,

    outputMode:
      request.outputMode,

    outputSchema:
      request.outputSchema,

    timeoutMs:
      request.timeoutMs,

    tenantId:
      request.tenantId ??
      selection.taskProfile.tenantId,

    store:
      request.store ??
      selection.taskProfile.store,

    contextId:
      request.contextId,

    contextVersion:
      request.contextVersion,
  };

  const bridge =
    input.bridge ||
    new DigitalBoostOpenClawBridge();

  const startedAt =
    new Date().toISOString();

  const started =
    Date.now();

  const bridgeResult =
    await bridge.runTask({
      task:
        runtimeRequest.task,

      prompt:
        runtimeRequest.prompt,

      /*
       * The backend receives the runtime identity.
       *
       * It does NOT receive a provider/model identity
       * invented from the semantic selection when an
       * explicit adapter exists.
       */
      model:
        expectedRuntimeModelRef,

      context:
        runtimeRequest.context,

      risk:
        mapRisk(
          selection.taskProfile.risk,
        ),

      requiresApproval:
        true,

      strictModelBinding:
        true,
    });

  const completedAt =
    new Date().toISOString();

  const latencyMs =
    Date.now() - started;

  /*
   * Runtime identity must come from the runtime result.
   */
  const runtimeModelRef =
    typeof bridgeResult.model ===
      "string"
      ? bridgeResult.model.trim()
      : "";

  return normalizePulseInferenceResult({
    request:
      runtimeRequest,

    bridgeResult,

    provider:
      "openclaw",

    runtimeModelRef,

    startedAt,

    completedAt,

    latencyMs,
  });
}

export function createPulseInferenceRuntimeRequest(
  input: {
    requestId:
      string;

    task:
      string;

    prompt:
      string;

    outputMode?:
      PulseInferenceOutputMode;

    outputSchema?:
      unknown;

    timeoutMs?:
      number;

    context?:
      Record<string, unknown>;

    tenantId?:
      string;

    store?:
      string;

    contextId?:
      string;

    contextVersion?:
      number;
  },
):
  PulseInferenceRuntimeRequest {
  return {
    requestId:
      input.requestId,

    task:
      input.task,

    prompt:
      input.prompt,

    outputMode:
      input.outputMode ||
      "TEXT",

    outputSchema:
      input.outputSchema,

    timeoutMs:
      input.timeoutMs,

    context:
      input.context,

    tenantId:
      input.tenantId,

    store:
      input.store,

    contextId:
      input.contextId,

    contextVersion:
      input.contextVersion,
  };
}

export default
  executePulseInference;
