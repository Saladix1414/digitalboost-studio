/**
 * DigitalBoostModelRouter
 *
 * P0.7.1 — integración con Model Intelligence.
 *
 * Responsabilidades:
 * - registrar la selección de modelos;
 * - aplicar compatibilidad dura;
 * - respetar preferencias sin convertirlas en autoridad;
 * - conservar fallback explícito;
 * - producir evidencia explicable mediante
 *   PulseModelSelectionContract.
 *
 * NO ejecuta modelos.
 * NO concede permisos.
 * NO modifica Governance.
 * NO ejecuta herramientas.
 */

import type {
  AIProvider,
  ModelCapability,
  ModelSelectionRequest,
  ModelSelectionResult,
} from "../types/DigitalBoostAI";

import DigitalBoostModelRegistry from "./DigitalBoostModelRegistry";

import {
  createPulseModelSelectionContract,
  normalizePulseModelTaskProfile,
  evaluatePulseModelCandidate,
  type PulseModelSelectionContract,
  type PulseModelTaskProfile,
} from "./DigitalBoostModelIntelligence";

export class DigitalBoostModelRouter {
  private readonly registry: DigitalBoostModelRegistry;

  constructor(
    registry: DigitalBoostModelRegistry,
  ) {
    this.registry = registry;
  }

  /*
   * Nueva ruta P0.7.1.
   *
   * La selección:
   * 1. normaliza el perfil;
   * 2. evalúa compatibilidad dura;
   * 3. puntúa únicamente candidatos elegibles;
   * 4. marca fallback cuando se debe abandonar
   *    el proveedor preferido;
   * 5. produce evidencia de selección.
   */
  selectIntelligent(
    profile: PulseModelTaskProfile,
  ): PulseModelSelectionContract {
    const candidates =
      this.registry
        .getAvailable()
        .slice()
        .sort((a, b) => {
          const aRef =
            `${a.provider}/${a.modelId}`;
          const bRef =
            `${b.provider}/${b.modelId}`;

          return aRef.localeCompare(bRef);
        });

    if (!candidates.length) {
      const rawSelection: ModelSelectionResult = {
        model: null,
        reason:
          "No hay modelos disponibles. Debe utilizarse Rules Engine.",
        fallbackUsed: true,
      };

      return createPulseModelSelectionContract({
        profile,
        rawSelection,
        candidates,
      });
    }

    const evaluations =
      candidates.map(model => ({
        model,
        evaluation:
          evaluatePulseModelCandidate(
            profile,
            model,
          ),
      }));

    const eligible =
      evaluations.filter(
        entry =>
          entry.evaluation.eligible,
      );

    if (!eligible.length) {
      const rawSelection: ModelSelectionResult = {
        model: null,
        reason:
          "No existe un modelo compatible con los requisitos de Model Intelligence.",
        fallbackUsed: true,
      };

      return createPulseModelSelectionContract({
        profile,
        rawSelection,
        candidates,
      });
    }

    const ranked =
      eligible
        .map(entry => ({
          model: entry.model,
          score:
            this.scoreEligibleModel(
              profile,
              entry.model,
            ),
        }))
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }

          const aRef =
            `${a.model.provider}/${a.model.modelId}`;
          const bRef =
            `${b.model.provider}/${b.model.modelId}`;

          return aRef.localeCompare(bRef);
        });

    const selected =
      ranked[0];

    const fallbackUsed =
      Boolean(
        profile.preferredProvider &&
          selected.model.provider !==
            profile.preferredProvider,
      );

    const reason =
      fallbackUsed
        ? `Proveedor preferido no elegible; fallback seleccionado: ${selected.model.provider}/${selected.model.modelId}.`
        : `Modelo seleccionado para tarea "${profile.task}".`;

    const rawSelection: ModelSelectionResult = {
      model: selected.model,
      reason,
      fallbackUsed,
    };

    return createPulseModelSelectionContract({
      profile,
      rawSelection,
      candidates,
    });
  }

  /*
   * Compatibilidad con la API existente.
   *
   * Los consumidores actuales siguen recibiendo
   * ModelSelectionResult, pero la selección ahora
   * pasa por Model Intelligence.
   */
  select(
    request: ModelSelectionRequest,
  ): ModelSelectionResult {
    const profile =
      normalizePulseModelTaskProfile({
        task: request.task,
        requiredCapabilities:
          request.capabilities || [],
        preferredProvider:
          request.preferredProvider,
        risk:
          request.risk === "high"
            ? "L3"
            : request.risk === "medium"
              ? "L2"
              : "L1",
        requireTools:
          Boolean(request.requireTools),
      });

    return this.selectIntelligent(
      profile,
    ).rawSelection;
  }

  selectForTask(
    task: string,
    capabilities: ModelCapability[] = [],
  ): ModelSelectionResult {
    return this.select({
      task,
      capabilities,
    });
  }

  /*
   * Preserva el scoring original, pero únicamente
   * después de que Model Intelligence confirme
   * compatibilidad.
   */
  private scoreEligibleModel(
    profile: PulseModelTaskProfile,
    model: {
      provider: AIProvider;
      modelId: string;
      preferredTasks: string[];
      capabilities: ModelCapability[];
      fallbackPriority: number;
    },
  ): number {
    let score = 0;

    if (
      profile.preferredProvider &&
      model.provider ===
        profile.preferredProvider
    ) {
      score += 100;
    }

    for (
      const capability
      of profile.requiredCapabilities
    ) {
      if (
        model.capabilities.includes(
          capability,
        )
      ) {
        score += 50;
      }
    }

    if (
      model.preferredTasks.some(
        task =>
          profile.task
            .toLowerCase()
            .includes(
              task.toLowerCase(),
            ),
      )
    ) {
      score += 40;
    }

    /*
     * Menor fallbackPriority =
     * mayor prioridad de selección.
     */
    score += Math.max(
      0,
      30 - model.fallbackPriority,
    );

    return score;
  }
}

export default DigitalBoostModelRouter;
