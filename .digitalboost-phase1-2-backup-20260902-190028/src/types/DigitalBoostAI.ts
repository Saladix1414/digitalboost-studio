/**
 * DigitalBoost AI — Canonical shared types
 *
 * Fase 1.1
 *
 * Este archivo define contratos comunes.
 * No ejecuta modelos ni workflows.
 */

export type AIProvider =
  | 'ollama'
  | 'openclaw'
  | 'rules'
  | 'unknown';

export type ModelCapability =
  | 'conversation'
  | 'reasoning'
  | 'structured'
  | 'seo'
  | 'products'
  | 'content'
  | 'analytics'
  | 'transformation'
  | 'general';

export interface DigitalBoostModel {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  capabilities: ModelCapability[];
  contextWindow?: number;
  available: boolean;
  preferredTasks: string[];
  fallbackPriority: number;
  discoveredAt: string;
}

export interface ModelSelectionRequest {
  task: string;
  capabilities?: ModelCapability[];
  preferredProvider?: AIProvider;
  risk?: 'low' | 'medium' | 'high';
  requireTools?: boolean;
}

export interface ModelSelectionResult {
  model: DigitalBoostModel | null;
  reason: string;
  fallbackUsed: boolean;
}

export interface OpenClawStatus {
  installed: boolean;
  gatewayAvailable: boolean;
  connected: boolean;
  providerAvailable: boolean;
  models: string[];
  checkedAt: string;
  error?: string;
}

export interface OllamaStatus {
  available: boolean;
  baseUrl: string;
  models: string[];
  checkedAt: string;
  error?: string;
}

export interface DigitalBoostAIHealth {
  ollama: OllamaStatus;
  openclaw: OpenClawStatus;
  checkedAt: string;
}
