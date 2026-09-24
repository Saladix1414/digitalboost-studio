import { assertPulseTenantIsolation } from "./DigitalBoostPulseTenantIsolation";
import {
  createHash,
  randomUUID,
} from "node:crypto";

import {
  existsSync,
  linkSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";

import path from "node:path";

import type {
  PulseExecutionClaim,
  PulseExecutionClaimResult,
  PulseExecutionClaimStore,
} from "../DigitalBoostPulseExecutionLedger";

export type ServerExecutionClaimStoreOptions = {
  /**
   * Directorio raíz compartido por el servidor.
   *
   * En producción puede apuntar a un volumen persistente.
   */
  rootDir?: string;

  /**
   * Namespace lógico del tenant.
   *
   * El tenant nunca forma directamente parte del path:
   * se transforma mediante SHA-256 para evitar path traversal
   * y mantener una frontera de almacenamiento explícita.
   */
  tenantId: string;
}

const DEFAULT_ROOT_DIR =
  process.env.PULSE_EXECUTION_CLAIM_DIR?.trim() ||
  path.resolve(
    process.cwd(),
    "data",
    "pulse-execution-claims",
  );

function hashNamespace(value: string): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

function normalizeTenantId(
  value: string,
): string {
  const tenantId = String(value || "").trim();

  if (!tenantId) {
    throw new Error(
      "Server execution claim tenantId is required.",
    );
  }

  return tenantId;
}

function normalizeApprovalId(
  value: string,
): string {
  const approvalId = String(value || "").trim();

  if (!approvalId) {
    throw new Error(
      "Server execution claim approval_id is required.",
    );
  }

  return approvalId;
}

function claimPayload(
  claim: PulseExecutionClaim,
): Buffer {
  return Buffer.from(
    JSON.stringify(claim) + "\n",
    "utf8",
  );
}

export class ServerExecutionClaimStore
  implements PulseExecutionClaimStore
{
  readonly atomic = true;

  readonly tenantId: string;
  readonly rootDir: string;

  private readonly tenantDir: string;

  constructor(
    options: ServerExecutionClaimStoreOptions,
  ) {
    this.tenantId =
      normalizeTenantId(
        options.tenantId,
      );

    this.rootDir =
      path.resolve(
        options.rootDir?.trim() ||
          DEFAULT_ROOT_DIR,
      );

    this.tenantDir = path.join(
      this.rootDir,
      hashNamespace(this.tenantId),
    );

    mkdirSync(
      this.tenantDir,
      {
        recursive: true,
        mode: 0o700,
      },
    );
  }

  private claimPath(
    approvalId: string,
  ): string {
    const normalized =
      normalizeApprovalId(
        approvalId,
      );

    return path.join(
      this.tenantDir,
      hashNamespace(normalized) +
        ".json",
    );
  }

  private readExistingClaim(
    filePath: string,
    expectedApprovalId: string,
  ): PulseExecutionClaim {
    const raw =
      readFileSync(
        filePath,
        "utf8",
      );

    const parsed =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.approval_id !==
        expectedApprovalId
    ) {
      throw new Error(
        "Server execution claim storage is invalid.",
      );
    }

    return parsed as PulseExecutionClaim;
  }

  claim(
    claim: PulseExecutionClaim,
  ): PulseExecutionClaimResult {
    // P0.4.22 — resource/claim tenant isolation.
    /*
     * P0.4.22:
     *
     * Server execution claims produced by the hardened execution path
     * carry tenant_id and must match the store tenant exactly.
     *
     * Historical/local claim-store tests and persisted records from
     * P0.4.18 may not carry tenant_id. Those records remain compatible;
     * they are already physically isolated by this store's tenantDir.
     *
     * No tenant is ever inferred from an absent field.
     */
    const claimTenantId = (
      claim as unknown as {
        tenant_id?: unknown;
      }
    ).tenant_id;

    if (claimTenantId !== undefined) {
      assertPulseTenantIsolation(
        this.tenantId,
        claimTenantId,
      );
    }

    try {
      const approvalId =
        normalizeApprovalId(
          claim.approval_id,
        );

      const filePath =
        this.claimPath(
          approvalId,
        );

      mkdirSync(
        this.tenantDir,
        {
          recursive: true,
          mode: 0o700,
        },
      );

      /**
       * IMPORTANTE:
       *
       * No hacemos:
       *
       *   exists -> write
       *
       * porque ese patrón es vulnerable a race conditions.
       *
       * El temp file contiene el payload COMPLETO.
       * Luego linkSync crea el destino exclusivamente si
       * todavía no existe. La creación del nombre final actúa
       * como la operación compare-and-set del adapter.
       */
      const tempPath =
        path.join(
          this.tenantDir,
          "." +
            hashNamespace(
              approvalId,
            ) +
            "." +
            process.pid +
            "." +
            randomUUID() +
            ".tmp",
        );

      try {
        writeFileSync(
          tempPath,
          claimPayload(claim),
          {
            flag: "wx",
            mode: 0o600,
          },
        );

        try {
          linkSync(
            tempPath,
            filePath,
          );

          return {
            claimed: true,
            claim,
          };
        } catch (error) {
          const code =
            error &&
            typeof error === "object" &&
            "code" in error
              ? String(
                  (error as {
                    code?: unknown;
                  }).code,
                )
              : "";

          if (code === "EEXIST") {
            const existing =
              this.readExistingClaim(
                filePath,
                approvalId,
              );

            return {
              claimed: false,
              reason: "ALREADY_CLAIMED",
            };
          }

          throw error;
        }
      } finally {
        try {
          if (
            existsSync(
              tempPath,
            )
          ) {
            unlinkSync(
              tempPath,
            );
          }
        } catch {}
      }
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        String(
          (error as {
            code?: unknown;
          }).code,
        ) === "EEXIST"
      ) {
        return {
          claimed: false,
          reason: "ALREADY_CLAIMED",
        };
      }

      return {
        claimed: false,
        reason: "STORAGE_UNAVAILABLE",
      };
    }
  }
}

export function createServerExecutionClaimStore(
  options: ServerExecutionClaimStoreOptions,
): ServerExecutionClaimStore {
  return new ServerExecutionClaimStore(
    options,
  );
}
