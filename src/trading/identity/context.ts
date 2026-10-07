import type {
  AuthenticationState,
  AuthorizationContext,
  IdentityContext,
  IdentityEvidence,
  UserIdentity,
} from "./types.ts";

function requireTimestamp(
  value: string,
  field: string
): void {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    !Number.isFinite(
      Date.parse(value)
    )
  ) {
    throw new Error(
      `${field} must be a valid timestamp.`
    );
  }
}

function normalizeStrings(
  values:
    readonly string[]
): readonly string[] {
  return [
    ...new Set(
      values
        .map(
          (value) =>
            value.trim()
        )
        .filter(Boolean)
    ),
  ].sort();
}

function normalizeEvidence(
  evidence:
    readonly IdentityEvidence[]
): readonly IdentityEvidence[] {
  return [...evidence].sort(
    (left, right) =>
      left.evidenceId.localeCompare(
        right.evidenceId
      )
  );
}

function validateAuthentication(
  identity:
    UserIdentity,
  authentication:
    AuthenticationState
): void {
  requireTimestamp(
    authentication.checkedAt,
    "authentication.checkedAt"
  );

  if (
    authentication.status ===
      "authenticated" &&
    authentication.subjectId !==
      identity.subjectId
  ) {
    throw new Error(
      "Authenticated subject does not match canonical identity subject."
    );
  }

  if (
    authentication.status ===
      "authenticated"
  ) {
    requireTimestamp(
      authentication.authenticatedAt,
      "authentication.authenticatedAt"
    );

    if (
      authentication.expiresAt
    ) {
      requireTimestamp(
        authentication.expiresAt,
        "authentication.expiresAt"
      );
    }
  }

  if (
    (
      authentication.status ===
        "stale" ||
      authentication.status ===
        "expired"
    ) &&
    authentication.subjectId &&
    authentication.subjectId !==
      identity.subjectId
  ) {
    throw new Error(
      "Authentication subject does not match canonical identity subject."
    );
  }

  if (
    authentication.status ===
      "expired"
  ) {
    requireTimestamp(
      authentication.expiredAt,
      "authentication.expiredAt"
    );
  }
}

function validateAuthorization(
  identity:
    UserIdentity,
  authorization:
    AuthorizationContext | null
): AuthorizationContext | null {
  if (!authorization) {
    return null;
  }

  if (
    authorization.userId !==
    identity.userId
  ) {
    throw new Error(
      "Authorization user does not match canonical identity."
    );
  }

  if (
    authorization.tenantId !==
    identity.tenantId
  ) {
    throw new Error(
      "Authorization tenant does not match canonical identity."
    );
  }

  requireTimestamp(
    authorization.evaluatedAt,
    "authorization.evaluatedAt"
  );

  if (
    !authorization.policyVersion.trim()
  ) {
    throw new Error(
      "Authorization policyVersion is required."
    );
  }

  return {
    ...authorization,

    roles:
      normalizeStrings(
        authorization.roles
      ),

    capabilities:
      normalizeStrings(
        authorization.capabilities
      ),
  };
}

function validateEvidence(
  identity:
    UserIdentity,
  evidence:
    readonly IdentityEvidence[]
): void {
  for (
    const item of evidence
  ) {
    if (
      item.subjectId !==
      identity.subjectId
    ) {
      throw new Error(
        "Identity evidence subject does not match canonical identity."
      );
    }

    if (
      item.grantsAuthority !==
      false
    ) {
      throw new Error(
        "Identity evidence cannot grant authority."
      );
    }

    requireTimestamp(
      item.observedAt,
      "identityEvidence.observedAt"
    );

    if (
      item.verifiedAt
    ) {
      requireTimestamp(
        item.verifiedAt,
        "identityEvidence.verifiedAt"
      );
    }

    if (
      item.expiresAt
    ) {
      requireTimestamp(
        item.expiresAt,
        "identityEvidence.expiresAt"
      );
    }
  }
}

export function createIdentityContext(
  input: IdentityContext
): IdentityContext {
  requireTimestamp(
    input.identity.createdAt,
    "identity.createdAt"
  );

  requireTimestamp(
    input.lastValidatedAt,
    "lastValidatedAt"
  );

  validateAuthentication(
    input.identity,
    input.authentication
  );

  const authorization =
    validateAuthorization(
      input.identity,
      input.authorization
    );

  validateEvidence(
    input.identity,
    input.evidence
  );

  return {
    identity: {
      ...input.identity,
    },

    sessionId:
      input.sessionId,

    authentication:
      input.authentication,

    authorization,

    evidence:
      normalizeEvidence(
        input.evidence
      ),

    lastValidatedAt:
      input.lastValidatedAt,
  };
}

export function isAuthenticatedIdentityContext(
  context:
    IdentityContext
): boolean {
  return (
    context.identity.state ===
      "active" &&
    context.authentication.status ===
      "authenticated"
  );
}

export function hasIdentityCapability(
  context:
    IdentityContext,
  capability: string
): boolean {
  if (
    !isAuthenticatedIdentityContext(
      context
    )
  ) {
    return false;
  }

  if (
    !context.authorization
  ) {
    return false;
  }

  return context.authorization.capabilities.includes(
    capability.trim()
  );
}
