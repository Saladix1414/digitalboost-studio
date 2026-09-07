/**
 * DigitalBoostOpenClawBridge
 *
 * Capa de aislamiento entre DigitalBoost/PULSE y OpenClaw.
 *
 * Esta primera versión NO ejecuta acciones destructivas.
 * El objetivo es establecer el contrato canónico.
 *
 * La comunicación sensible deberá pasar por server.ts/API
 * y nunca exponer credenciales al navegador.
 */

import type {
  OpenClawStatus,
} from '../types/DigitalBoostAI';

export interface OpenClawTaskRequest {
  task: string;
  prompt?: string;
  model?: string;
  context?: Record<string, unknown>;
  risk?: 'low' | 'medium' | 'high';
  requiresApproval?: boolean;
}

export interface OpenClawTaskResult {
  accepted: boolean;
  executionId?: string;
  status:
    | 'proposed'
    | 'awaiting_approval'
    | 'executing'
    | 'completed'
    | 'failed'
    | 'rejected'
    | 'cancelled';
  result?: unknown;
  error?: string;
}

export class DigitalBoostOpenClawBridge {
  private readonly baseUrl: string;

  constructor(
    baseUrl = '/api/openclaw'
  ) {
    const normalized = baseUrl.replace(/\/+$/, '');

    /*
     * Browser:
     *   /api/openclaw
     * sigue siendo una ruta relativa al host actual.
     *
     * Node/tsx:
     *   fetch() necesita una URL absoluta.
     *
     * En DigitalBoost el servidor local expone OpenClaw
     * en el mismo puerto que la aplicación.
     */
    if (
      typeof window === 'undefined' &&
      normalized.startsWith('/')
    ) {
      this.baseUrl = `http://127.0.0.1:3000${normalized}`;
    } else {
      this.baseUrl = normalized;
    }
  }

  async getStatus(): Promise<OpenClawStatus> {
    try {
      const response = await fetch(
        `${this.baseUrl}/status`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        return unavailable(
          `OpenClaw status HTTP ${response.status}`
        );
      }

      const data = await response.json();

      const models = Array.isArray(data.models)
        ? data.models
        : [];

      const providerAvailable =
        Boolean(data.providerAvailable) ||
        Boolean(data.ollama) ||
        models.length > 0;

      return {
        installed:
          data.installed === undefined
            ? providerAvailable
            : Boolean(data.installed),
        gatewayAvailable:
          data.gatewayAvailable === undefined
            ? providerAvailable
            : Boolean(data.gatewayAvailable),
        connected:
          data.connected === undefined
            ? providerAvailable
            : Boolean(data.connected),
        providerAvailable,
        models,
        checkedAt: new Date().toISOString(),
        error: data.error,
      };
    } catch (error) {
      return unavailable(
        error instanceof Error
          ? error.message
          : 'OpenClaw unavailable'
      );
    }
  }

  async runTask(
    request: OpenClawTaskRequest
  ): Promise<OpenClawTaskResult> {
    /*
     * Seguridad:
     * Todas las tareas se consideran aprobables.
     * La ejecución real será implementada en el backend.
     */
    try {
      const response = await fetch(
        `${this.baseUrl}/task`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            task: request.task,
            prompt:
              request.prompt ||
              request.task,
            model: request.model,
            context: request.context,
            risk: request.risk,
            requiresApproval:
              request.requiresApproval ?? true,
          }),
        }
      );

      if (!response.ok) {
        return {
          accepted: false,
          status: 'failed',
          error:
            `OpenClaw task HTTP ${response.status}`,
        };
      }

      const data = await response.json();

      if (
        data &&
        typeof data === 'object' &&
        'ok' in data &&
        !('accepted' in data)
      ) {
        if (!data.ok) {
          return {
            accepted: false,
            status: 'failed',
            error:
              typeof data.error === 'string'
                ? data.error
                : 'OpenClaw task failed',
          };
        }

        return {
          accepted: true,
          status: 'completed',
          result:
            typeof data.response === 'string'
              ? data.response
              : data.output ?? data,
        };
      }

      return data;
    } catch (error) {
      return {
        accepted: false,
        status: 'failed',
        error:
          error instanceof Error
            ? error.message
            : 'OpenClaw task failed',
      };
    }
  }
}

function unavailable(
  error: string
): OpenClawStatus {
  return {
    installed: false,
    gatewayAvailable: false,
    connected: false,
    providerAvailable: false,
    models: [],
    checkedAt: new Date().toISOString(),
    error,
  };
}

export default DigitalBoostOpenClawBridge;
