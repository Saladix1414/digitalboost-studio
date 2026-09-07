/**
 * DigitalBoostModelRegistry
 *
 * Registro normalizado de modelos.
 *
 * IMPORTANTE:
 * No se hardcodean qwen2:1.5b, llama3:8b,
 * ni ninguna otra variante concreta.
 *
 * Los IDs reales deben provenir del catálogo descubierto.
 */

import type {
  DigitalBoostModel,
  AIProvider,
  ModelCapability,
} from '../types/DigitalBoostAI';

export class DigitalBoostModelRegistry {
  private models = new Map<string, DigitalBoostModel>();

  register(model: DigitalBoostModel): void {
    const key = `${model.provider}/${model.modelId}`;
    this.models.set(key, {
      ...model,
      discoveredAt:
        model.discoveredAt || new Date().toISOString(),
    });
  }

  registerOllamaModel(
    modelId: string,
    options: {
      displayName?: string;
      capabilities?: ModelCapability[];
      preferredTasks?: string[];
      contextWindow?: number;
      fallbackPriority?: number;
    } = {}
  ): DigitalBoostModel {
    const model: DigitalBoostModel = {
      provider: 'ollama',
      modelId,
      displayName:
        options.displayName || modelId,
      capabilities:
        options.capabilities || inferCapabilities(modelId),
      contextWindow:
        options.contextWindow,
      available: true,
      preferredTasks:
        options.preferredTasks || [],
      fallbackPriority:
        options.fallbackPriority ?? 100,
      discoveredAt: new Date().toISOString(),
    };

    this.register(model);
    return model;
  }

  unregister(
    provider: AIProvider,
    modelId: string
  ): boolean {
    return this.models.delete(
      `${provider}/${modelId}`
    );
  }

  get(
    provider: AIProvider,
    modelId: string
  ): DigitalBoostModel | undefined {
    return this.models.get(
      `${provider}/${modelId}`
    );
  }

  getAll(): DigitalBoostModel[] {
    return Array.from(this.models.values());
  }

  getAvailable(): DigitalBoostModel[] {
    return this.getAll().filter(
      model => model.available
    );
  }

  getByProvider(
    provider: AIProvider
  ): DigitalBoostModel[] {
    return this.getAll().filter(
      model => model.provider === provider
    );
  }

  clear(): void {
    this.models.clear();
  }
}

function inferCapabilities(
  modelId: string
): ModelCapability[] {
  const id = modelId.toLowerCase();
  const capabilities: ModelCapability[] = [
    'general',
  ];

  if (id.includes('qwen')) {
    capabilities.push(
      'structured',
      'transformation',
      'products',
      'seo',
      'content'
    );
  }

  if (id.includes('llama')) {
    capabilities.push(
      'conversation',
      'reasoning'
    );
  }

  return Array.from(new Set(capabilities));
}

export default DigitalBoostModelRegistry;
