/**
 * DigitalBoostModelRuntimeBinding
 *
 * P0.7.2.3
 *
 * Separa la identidad del modelo seleccionado por PULSE
 * de la identidad del modelo que realmente debe ejecutar
 * el runtime.
 *
 * Modos:
 *
 * EXACT
 *   selectionModelRef === runtimeModelRef
 *
 * EXPLICIT_ADAPTER
 *   selectionModelRef !== runtimeModelRef
 *   y existe un adaptador explícitamente identificado.
 *
 * UNBOUND
 *   no existe evidencia suficiente para determinar qué
 *   runtime model debe ejecutar la selección.
 *
 * UNBOUND nunca es ejecutable.
 */

import type {
  DigitalBoostModel,
} from "../types/DigitalBoostAI";

export const PULSE_MODEL_RUNTIME_BINDING_CONTRACT =
  "p0.7.2.3" as const;

export type PulseModelRuntimeBindingMode =
  | "EXACT"
  | "EXPLICIT_ADAPTER"
  | "UNBOUND";

export interface PulseModelRuntimeBinding {
  contract:
    typeof PULSE_MODEL_RUNTIME_BINDING_CONTRACT;

  selectionModelRef:
    string;

  runtimeModelRef?:
    string;

  mode:
    PulseModelRuntimeBindingMode;

  adapterId?:
    string;
}

export interface PulseModelRuntimeBindingInput {
  runtimeModelRef?:
    string;

  mode?:
    PulseModelRuntimeBindingMode;

  adapterId?:
    string;
}

export interface PulseModelRuntimeBindingValidation {
  valid:
    boolean;

  errors:
    string[];
}

function normalizeRef(
  value:
    string | undefined,
): string {
  return String(value || "").trim();
}

function modelRef(
  model:
    DigitalBoostModel,
): string {
  return `${model.provider}/${model.modelId}`;
}

export function buildPulseModelRuntimeBinding(
  model:
    DigitalBoostModel | null,
  input:
    PulseModelRuntimeBindingInput = {},
):
  PulseModelRuntimeBinding | undefined {
  if (!model) {
    return undefined;
  }

  const selectionModelRef =
    modelRef(model);

  const explicitRuntimeModelRef =
    normalizeRef(
      input.runtimeModelRef,
    );

  const explicitAdapterId =
    normalizeRef(
      input.adapterId,
    );

  /*
   * No explicit mapping:
   *
   * Ollama models are directly executable through the
   * currently evidenced local runtime identity.
   *
   * Other providers remain UNBOUND until an explicit
   * adapter establishes the runtime identity.
   */
  if (!explicitRuntimeModelRef) {
    if (model.provider === "ollama") {
      return {
        contract:
          PULSE_MODEL_RUNTIME_BINDING_CONTRACT,

        selectionModelRef,

        runtimeModelRef:
          selectionModelRef,

        mode:
          "EXACT",
      };
    }

    return {
      contract:
        PULSE_MODEL_RUNTIME_BINDING_CONTRACT,

      selectionModelRef,

      mode:
        "UNBOUND",
    };
  }

  const requestedMode =
    input.mode ||
    (
      explicitRuntimeModelRef ===
      selectionModelRef
        ? "EXACT"
        : "EXPLICIT_ADAPTER"
    );

  if (
    requestedMode ===
      "EXACT" &&
    explicitRuntimeModelRef !==
      selectionModelRef
  ) {
    return {
      contract:
        PULSE_MODEL_RUNTIME_BINDING_CONTRACT,

      selectionModelRef,

      runtimeModelRef:
        explicitRuntimeModelRef,

      mode:
        "EXACT",
    };
  }

  if (
    requestedMode ===
      "EXPLICIT_ADAPTER"
  ) {
    return {
      contract:
        PULSE_MODEL_RUNTIME_BINDING_CONTRACT,

      selectionModelRef,

      runtimeModelRef:
        explicitRuntimeModelRef,

      mode:
        "EXPLICIT_ADAPTER",

      adapterId:
        explicitAdapterId ||
        undefined,
    };
  }

  return {
    contract:
      PULSE_MODEL_RUNTIME_BINDING_CONTRACT,

    selectionModelRef,

    runtimeModelRef:
      explicitRuntimeModelRef,

    mode:
      "EXACT",
  };
}

export function validatePulseModelRuntimeBinding(
  binding:
    PulseModelRuntimeBinding |
    undefined,
):
  PulseModelRuntimeBindingValidation {
  if (!binding) {
    return {
      valid: false,
      errors: [
        "RUNTIME_BINDING_MISSING",
      ],
    };
  }

  const selection =
    normalizeRef(
      binding.selectionModelRef,
    );

  const runtime =
    normalizeRef(
      binding.runtimeModelRef,
    );

  const errors:
    string[] = [];

  if (!selection) {
    errors.push(
      "SELECTION_MODEL_REF_MISSING",
    );
  }

  if (
    binding.mode === "EXACT"
  ) {
    if (!runtime) {
      errors.push(
        "RUNTIME_MODEL_REF_MISSING",
      );
    } else if (
      selection !== runtime
    ) {
      errors.push(
        "EXACT_BINDING_MISMATCH",
      );
    }
  }

  if (
    binding.mode ===
    "EXPLICIT_ADAPTER"
  ) {
    if (!runtime) {
      errors.push(
        "RUNTIME_MODEL_REF_MISSING",
      );
    }

    if (!normalizeRef(binding.adapterId)) {
      errors.push(
        "ADAPTER_ID_MISSING",
      );
    }

    if (
      runtime === selection
    ) {
      errors.push(
        "EXPLICIT_ADAPTER_MUST_CHANGE_RUNTIME_IDENTITY",
      );
    }
  }

  if (
    binding.mode === "UNBOUND"
  ) {
    errors.push(
      "RUNTIME_BINDING_UNAVAILABLE",
    );
    if (runtime) {
      errors.push(
        "UNBOUND_RUNTIME_REF_FORBIDDEN",
      );
    }
  }

  return {
    valid:
      errors.length === 0,

    errors,
  };
}
