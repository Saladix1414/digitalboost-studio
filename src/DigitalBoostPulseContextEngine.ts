import {
  hashProposal,
  stableSerialize,
} from "./DigitalBoostPulseContracts";

import type {
  PulseStateSnapshot,
} from "./DigitalBoostPulseSnapshot";

export const PULSE_CONTEXT_ENGINE_CONTRACT =
  "p0.5.0";

export type PulseContextTrust =
  | "raw"
  | "derived"
  | "trusted"
  | "untrusted";

export type PulseContextFreshness =
  | "fresh"
  | "aging"
  | "stale"
  | "unknown";

export type PulseContextItem<T = unknown> = {
  id: string;
  key: string;
  tenantId: string;
  value: T;
  source: string;
  provenance: string;
  timestamp: string;
  trust: PulseContextTrust;
  evidenceRefs: string[];
  constraints: string[];
  relevance: number;
  mandatory: boolean;
  ttlMs: number;
  freshness: PulseContextFreshness;
};

export type PulseContextConflict = {
  conflictId: string;
  key: string;
  itemIds: string[];
  values: unknown[];
  resolution: "UNRESOLVED";
  severity: "WARNING" | "ERROR";
};

export type PulseContextCompression = {
  maxBytes: number;
  originalBytes: number;
  finalBytes: number;
  truncated: boolean;
  droppedItemIds: string[];
  preservedMandatory: string[];
  preservedMandatoryEvidence: string[];
};

export type PulseContextAssembly = {
  contextId: string;
  tenantId: string;
  snapshotId: string;
  snapshotVersion: string;
  contractVersion:
    typeof PULSE_CONTEXT_ENGINE_CONTRACT;
  policyVersion: string;
  generatedAt: string;
  items: PulseContextItem[];
  conflicts: PulseContextConflict[];
  compression: PulseContextCompression;
  version: string;
};

export class PulseContextAssemblyError
  extends Error
{
  readonly code: string;

  constructor(
    code: string,
    message: string,
  ) {
    super(message);
    this.name =
      "PulseContextAssemblyError";
    this.code = code;
  }
}

function assertText(
  value: unknown,
  name: string,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new PulseContextAssemblyError(
      "INVALID_CONTEXT_METADATA",
      `${name} must be a non-empty string`,
    );
  }
}

function assertTenant(
  value: unknown,
): asserts value is string {
  assertText(value, "tenantId");

  if (value.includes("\u0000")) {
    throw new PulseContextAssemblyError(
      "INVALID_TENANT",
      "tenantId contains a null byte",
    );
  }
}

function byteLength(
  value: unknown,
): number {
  return new TextEncoder()
    .encode(JSON.stringify(value))
    .byteLength;
}

function freshnessFrom(
  timestamp: string,
  ttlMs: number,
  nowMs: number,
): PulseContextFreshness {
  const captured =
    Date.parse(timestamp);

  if (
    !Number.isFinite(captured) ||
    !Number.isFinite(ttlMs) ||
    ttlMs <= 0
  ) {
    return "unknown";
  }

  const age =
    Math.max(0, nowMs - captured);

  if (age <= ttlMs * 0.5) {
    return "fresh";
  }

  if (age <= ttlMs) {
    return "aging";
  }

  return "stale";
}

function normalizeItem(
  item: PulseContextItem,
  nowMs: number,
): PulseContextItem {
  assertText(item.id, "item.id");
  assertText(item.key, "item.key");
  assertTenant(item.tenantId);
  assertText(item.source, "item.source");
  assertText(
    item.provenance,
    "item.provenance",
  );
  assertText(
    item.timestamp,
    "item.timestamp",
  );

  if (
    ![
      "raw",
      "derived",
      "trusted",
      "untrusted",
    ].includes(item.trust)
  ) {
    throw new PulseContextAssemblyError(
      "INVALID_CONTEXT_TRUST",
      `Invalid trust for ${item.id}`,
    );
  }

  if (
    !Array.isArray(item.evidenceRefs) ||
    !Array.isArray(item.constraints)
  ) {
    throw new PulseContextAssemblyError(
      "INVALID_CONTEXT_METADATA",
      `Invalid metadata arrays for ${item.id}`,
    );
  }

  if (
    !Number.isFinite(item.relevance) ||
    item.relevance < 0 ||
    item.relevance > 1
  ) {
    throw new PulseContextAssemblyError(
      "INVALID_CONTEXT_RELEVANCE",
      `Invalid relevance for ${item.id}`,
    );
  }

  if (
    !Number.isFinite(item.ttlMs) ||
    item.ttlMs <= 0
  ) {
    throw new PulseContextAssemblyError(
      "INVALID_CONTEXT_TTL",
      `Invalid ttlMs for ${item.id}`,
    );
  }

  return {
    ...item,
    evidenceRefs: [
      ...new Set(
        item.evidenceRefs.map(String),
      ),
    ].sort(),

    constraints: [
      ...new Set(
        item.constraints.map(String),
      ),
    ].sort(),

    freshness: freshnessFrom(
      item.timestamp,
      item.ttlMs,
      nowMs,
    ),
  };
}

function detectConflicts(
  items: PulseContextItem[],
): PulseContextConflict[] {
  const groups =
    new Map<
      string,
      PulseContextItem[]
    >();

  for (const item of items) {
    const groupKey =
      `${item.tenantId}\u001f${item.key}`;

    const current =
      groups.get(groupKey) ?? [];

    current.push(item);
    groups.set(
      groupKey,
      current,
    );
  }

  const conflicts:
    PulseContextConflict[] = [];

  for (
    const grouped of groups.values()
  ) {
    const distinct =
      new Map<string, unknown>();

    for (
      const item of grouped
    ) {
      distinct.set(
        stableSerialize(
          item.value,
        ),
        item.value,
      );
    }

    if (distinct.size <= 1) {
      continue;
    }

    const itemIds =
      grouped
        .map((item) => item.id)
        .sort();

    conflicts.push({
      conflictId:
        `conflict_${hashProposal({
          key: grouped[0].key,
          itemIds,
        })}`,

      key:
        grouped[0].key,

      itemIds,

      values: [
        ...distinct.values(),
      ],

      resolution:
        "UNRESOLVED",

      severity:
        grouped.some(
          (item) =>
            item.mandatory,
        )
          ? "ERROR"
          : "WARNING",
    });
  }

  return conflicts.sort(
    (a, b) =>
      a.conflictId.localeCompare(
        b.conflictId,
      ),
  );
}

function freshnessRank(
  value: PulseContextFreshness,
): number {
  return {
    unknown: 1,
    stale: 2,
    aging: 3,
    fresh: 4,
  }[value];
}

function sortItems(
  items: PulseContextItem[],
): PulseContextItem[] {
  return [...items].sort(
    (a, b) =>
      Number(b.mandatory) -
        Number(a.mandatory) ||

      freshnessRank(
        b.freshness,
      ) -
        freshnessRank(
          a.freshness,
        ) ||

      b.relevance -
        a.relevance ||

      a.id.localeCompare(
        b.id,
      ),
  );
}

function compressionRank(
  value: PulseContextFreshness,
): number {
  return {
    unknown: 1,
    stale: 2,
    aging: 3,
    fresh: 4,
  }[value];
}

export function contextItem<T>(
  input: Omit<
    PulseContextItem<T>,
    "freshness"
  >,
): PulseContextItem<T> {
  return {
    ...input,
    freshness: "unknown",
  };
}

function assemblyIdentityItems(
  items: PulseContextItem[],
): Array<Omit<PulseContextItem, "timestamp" | "freshness">> {
  return items.map(
    ({
      timestamp: _timestamp,
      freshness: _freshness,
      ...identity
    }) => identity,
  );
}

export function assemblePulseContext(
  input: {
    tenantId: string;
    snapshot: PulseStateSnapshot;
    policyVersion: string;
    items: PulseContextItem[];
    now?: number;
    maxBytes?: number;
  },
): PulseContextAssembly {
  assertTenant(
    input.tenantId,
  );

  assertText(
    input.policyVersion,
    "policyVersion",
  );

  if (
    !input.snapshot ||
    input.snapshot.tenant !==
      input.tenantId
  ) {
    throw new PulseContextAssemblyError(
      "TENANT_ISOLATION_VIOLATION",
      "Snapshot tenant does not match requested tenant",
    );
  }

  if (
    !Array.isArray(
      input.items,
    )
  ) {
    throw new PulseContextAssemblyError(
      "INVALID_CONTEXT_ITEMS",
      "items must be an array",
    );
  }

  const nowMs =
    input.now ??
    Date.now();

  const maxBytes =
    input.maxBytes ??
    24000;

  if (
    !Number.isInteger(
      maxBytes,
    ) ||
    maxBytes < 1024
  ) {
    throw new PulseContextAssemblyError(
      "INVALID_CONTEXT_LIMIT",
      "maxBytes must be an integer >= 1024",
    );
  }

  const ids =
    new Set<string>();

  const normalized =
    input.items.map(
      (item) => {
        if (ids.has(item.id)) {
          throw new PulseContextAssemblyError(
            "DUPLICATE_CONTEXT_ITEM",
            `Duplicate context item: ${item.id}`,
          );
        }

        ids.add(item.id);

        if (
          item.tenantId !==
          input.tenantId
        ) {
          throw new PulseContextAssemblyError(
            "CROSS_TENANT_CONTEXT",
            `Item ${item.id} belongs to another tenant`,
          );
        }

        return normalizeItem(
          item,
          nowMs,
        );
      },
    );

  const sorted =
    sortItems(
      normalized,
    );

  const conflicts =
    detectConflicts(
      sorted,
    );

  const mandatory =
    sorted.filter(
      (item) =>
        item.mandatory,
    );

  const originalBytes =
    byteLength(sorted);

  const droppedItemIds:
    string[] = [];

  let retained =
    [...sorted];

  while (
    byteLength(
      retained,
    ) > maxBytes
  ) {
    const optional =
      retained.filter(
        (item) =>
          !item.mandatory,
      );

    if (
      optional.length === 0
    ) {
      break;
    }

    const candidate =
      [...optional].sort(
        (a, b) =>
          a.relevance -
            b.relevance ||

          compressionRank(
            a.freshness,
          ) -
            compressionRank(
              b.freshness,
            ) ||

          b.id.localeCompare(
            a.id,
          ),
      )[0];

    retained =
      retained.filter(
        (item) =>
          item.id !==
          candidate.id,
      );

    droppedItemIds.push(
      candidate.id,
    );
  }

  const finalBytes =
    byteLength(
      retained,
    );

  if (
    finalBytes >
    maxBytes
  ) {
    throw new PulseContextAssemblyError(
      "MANDATORY_CONTEXT_EXCEEDS_LIMIT",
      `Mandatory context requires ${finalBytes} bytes but maxBytes is ${maxBytes}`,
    );
  }

  const compression:
    PulseContextCompression = {
    maxBytes,
    originalBytes,
    finalBytes,

    truncated:
      droppedItemIds.length >
      0,

    droppedItemIds:
      [...droppedItemIds]
        .sort(),

    preservedMandatory:
      mandatory
        .map(
          (item) =>
            item.id,
        )
        .sort(),

    preservedMandatoryEvidence:
      [
        ...new Set(
          mandatory.flatMap(
            (item) =>
              item.evidenceRefs,
          ),
        ),
      ].sort(),
  };

  const canonical = {
    contractVersion:
      PULSE_CONTEXT_ENGINE_CONTRACT,

    policyVersion:
      input.policyVersion,

    tenantId:
      input.tenantId,

    snapshotId:
      input.snapshot.id,

    snapshotVersion:
      input.snapshot.version,

      // Semantic assembly identity.
      // Volatile observation metadata such as timestamp and
      // freshness remains in retained items but is excluded
      // from the canonical identity hash.
      items:
        assemblyIdentityItems(
          retained,
        ),

    conflicts,

    compression,
  };

  const version =
    hashProposal(
      canonical,
    );

  return {
    contextId:
      `ctx_${version}`,

    tenantId:
      input.tenantId,

    snapshotId:
      input.snapshot.id,

    snapshotVersion:
      input.snapshot.version,

    contractVersion:
      PULSE_CONTEXT_ENGINE_CONTRACT,

    policyVersion:
      input.policyVersion,

    generatedAt:
      new Date(
        nowMs,
      ).toISOString(),

    items:
      retained,

    conflicts,

    compression,

    version,
  };
}

export function contextItemFreshness(
  item: PulseContextItem,
  now = Date.now(),
): PulseContextFreshness {
  return freshnessFrom(
    item.timestamp,
    item.ttlMs,
    now,
  );
}
