/**
 * DigitalBoostModelRouter
 *
 * Decide qué modelo usar sin depender de una etiqueta
 * concreta de Ollama.
 *
 * Fallback:
 * modelo especializado
 * -> otro modelo compatible
 * -> Rules Engine
 */

import type {
  ModelCapability,
  ModelSelectionRequest,
  ModelSelectionResult,
} from '../types/DigitalBoostAI';

import DigitalBoostModelRegistry from './DigitalBoostModelRegistry';

export class DigitalBoostModelRouter {
  constructor(
    private readonly registry: DigitalBoostModelRegistry
  ) {}

  select(
    request: ModelSelectionRequest
  ): ModelSelectionResult {
    const available =
      this.registry.getAvailable();

    if (!available.length) {
      return {
        model: null,
        reason:
          'No hay modelos disponibles. Debe utilizarse Rules Engine.',
        fallbackUsed: true,
      };
    }

    const requestedCapabilities =
      request.capabilities || [];

    const ranked = available
      .map(model => {
        let score = 0;

        if (
          request.preferredProvider &&
          model.provider === request.preferredProvider
        ) {
          score += 100;
        }

        for (const capability of requestedCapabilities) {
          if (
            model.capabilities.includes(capability)
          ) {
            score += 50;
          }
        }

        if (
          model.preferredTasks.some(task =>
            request.task
              .toLowerCase()
              .includes(task.toLowerCase())
          )
        ) {
          score += 40;
        }

        /*
         * Menor fallbackPriority = mayor prioridad.
         */
        score += Math.max(
          0,
          30 - model.fallbackPriority
        );

        if (
          request.requireTools &&
          model.provider === 'ollama'
        ) {
          /*
           * Ollama por sí solo no implica herramientas.
           * OpenClaw debe encargarse de la orquestación.
           */
          score -= 10;
        }

        return { model, score };
      })
      .sort((a, b) => b.score - a.score);

    const selected = ranked[0];

    if (!selected) {
      return {
        model: null,
        reason:
          'No se encontró un modelo compatible.',
        fallbackUsed: true,
      };
    }

    return {
      model: selected.model,
      reason:
        `Modelo seleccionado para tarea "${request.task}".`,
      fallbackUsed: false,
    };
  }

  selectForTask(
    task: string,
    capabilities: ModelCapability[] = []
  ): ModelSelectionResult {
    return this.select({
      task,
      capabilities,
    });
  }
}

export default DigitalBoostModelRouter;
