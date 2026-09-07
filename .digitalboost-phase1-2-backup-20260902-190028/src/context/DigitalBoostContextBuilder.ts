/**
 * DigitalBoostContextBuilder
 *
 * Construye el contexto operativo normalizado que PULSE
 * puede entregar a modelos o runtimes agénticos.
 *
 * Importante:
 * - No ejecuta acciones.
 * - No llama modelos.
 * - No envía secretos.
 * - No modifica Store Builder.
 */

export interface DigitalBoostContext {
  version: string;
  timestamp: string;
  source: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  permissions: string[];

  store: Record<string, unknown>;
  commerce: Record<string, unknown>;
  products: Record<string, unknown>;
  customers: Record<string, unknown>;
  orders: Record<string, unknown>;
  inventory: Record<string, unknown>;
  marketing: Record<string, unknown>;
  seo: Record<string, unknown>;
  analytics: Record<string, unknown>;
  pulse: Record<string, unknown>;
}

export interface DigitalBoostContextInput {
  store?: Record<string, unknown>;
  commerce?: Record<string, unknown>;
  products?: Record<string, unknown>;
  customers?: Record<string, unknown>;
  orders?: Record<string, unknown>;
  inventory?: Record<string, unknown>;
  marketing?: Record<string, unknown>;
  seo?: Record<string, unknown>;
  analytics?: Record<string, unknown>;
  pulse?: Record<string, unknown>;

  permissions?: string[];
  confidence?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  source?: string;
}

export class DigitalBoostContextBuilder {
  static readonly VERSION = '1.0.0';

  build(input: DigitalBoostContextInput = {}): DigitalBoostContext {
    return {
      version: DigitalBoostContextBuilder.VERSION,
      timestamp: new Date().toISOString(),
      source: input.source || 'digitalboost',
      confidence: clamp(input.confidence ?? 1),
      riskLevel: input.riskLevel ?? 'low',
      permissions: Array.isArray(input.permissions)
        ? [...input.permissions]
        : [],

      store: sanitize(input.store),
      commerce: sanitize(input.commerce),
      products: sanitize(input.products),
      customers: sanitize(input.customers),
      orders: sanitize(input.orders),
      inventory: sanitize(input.inventory),
      marketing: sanitize(input.marketing),
      seo: sanitize(input.seo),
      analytics: sanitize(input.analytics),
      pulse: sanitize(input.pulse),
    };
  }
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function sanitize(
  value?: Record<string, unknown>
): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  /*
   * Primera capa de seguridad:
   * eliminamos campos que típicamente pueden contener secretos.
   */
  const blocked = new Set([
    'password',
    'passwd',
    'token',
    'apiKey',
    'api_key',
    'secret',
    'authorization',
    'accessToken',
    'refreshToken',
    'privateKey',
  ]);

  const output: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(value)) {
    if (blocked.has(key)) continue;
    output[key] = val;
  }

  return output;
}

export default DigitalBoostContextBuilder;
