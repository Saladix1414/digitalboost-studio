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
    this.baseUrl = baseUrl.replace(/\/+$/, '');
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

      return {
        installed: Boolean(data.installed),
        gatewayAvailable:
          Boolean(data.gatewayAvailable),
        connected:
          Boolean(data.connected),
        providerAvailable:
          Boolean(data.providerAvailable),
        models: Array.isArray(data.models)
          ? data.models
          : [],
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
            ...request,
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

      return await response.json();
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
