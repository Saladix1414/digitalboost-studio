import type {
  IdentityEvidenceId,
  SessionId,
  SubjectId,
  TenantId,
  UserId,
} from "./types.ts";

type CanonicalKind =
  | "user"
  | "tenant"
  | "subject"
  | "session"
  | "evidence";

const PREFIXES:
  Readonly<
    Record<
      CanonicalKind,
      string
    >
  > = {
  user: "usr_",
  tenant: "ten_",
  subject: "sub_",
  session: "ses_",
  evidence: "iev_",
};

const MAX_ID_LENGTH =
  160;

const CANONICAL_BODY =
  /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

function rejectDirectIdentityAlias(
  value: string
): void {
  if (
    value.includes("@")
  ) {
    throw new Error(
      "Canonical identity IDs cannot be an email address."
    );
  }

  if (
    /^0x[0-9a-f]{40}$/i.test(
      value
    )
  ) {
    throw new Error(
      "Canonical identity IDs cannot be a wallet address."
    );
  }
}

function normalizeCanonicalId(
  value: string,
  kind: CanonicalKind
): string {
  const normalized =
    value.trim();

  if (!normalized) {
    throw new Error(
      `${kind} identity ID is required.`
    );
  }

  if (
    normalized.length >
    MAX_ID_LENGTH
  ) {
    throw new Error(
      `${kind} identity ID exceeds maximum length.`
    );
  }

  rejectDirectIdentityAlias(
    normalized
  );

  const prefix =
    PREFIXES[kind];

  if (
    !normalized.startsWith(
      prefix
    )
  ) {
    throw new Error(
      `${kind} identity ID must use canonical prefix "${prefix}".`
    );
  }

  const body =
    normalized.slice(
      prefix.length
    );

  if (
    body.length < 6 ||
    !CANONICAL_BODY.test(body)
  ) {
    throw new Error(
      `${kind} identity ID has invalid canonical format.`
    );
  }

  if (
    normalized === "*" ||
    normalized.toLowerCase() ===
      "global"
  ) {
    throw new Error(
      `${kind} identity ID cannot use a wildcard identity.`
    );
  }

  return normalized;
}

export function createUserId(
  value: string
): UserId {
  return normalizeCanonicalId(
    value,
    "user"
  ) as UserId;
}

export function createTenantId(
  value: string
): TenantId {
  return normalizeCanonicalId(
    value,
    "tenant"
  ) as TenantId;
}

export function createSubjectId(
  value: string
): SubjectId {
  return normalizeCanonicalId(
    value,
    "subject"
  ) as SubjectId;
}

export function createSessionId(
  value: string
): SessionId {
  return normalizeCanonicalId(
    value,
    "session"
  ) as SessionId;
}

export function createIdentityEvidenceId(
  value: string
): IdentityEvidenceId {
  return normalizeCanonicalId(
    value,
    "evidence"
  ) as IdentityEvidenceId;
}
