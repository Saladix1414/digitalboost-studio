import type {
  IdentityContext,
  SessionId,
  TenantId,
  UserId,
} from "./types.ts";

export type TradingEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production";

export type WorkspaceId =
  string & {
    readonly __workspaceId:
      "WorkspaceId";
  };

/**
 * UI selections are descriptive context only.
 *
 * They must never become authorization evidence.
 */
export type AccountSelection = {
  readonly accountRef:
    string;

  readonly selectedAt:
    string;
};

export type WalletSelection = {
  /**
   * This is an opaque selection reference.
   *
   * Phase 33C introduces the canonical WalletBinding
   * model. It is intentionally not a wallet address.
   */
  readonly walletRef:
    string;

  readonly selectedAt:
    string;
};

export type TradingUserContext = {
  readonly userId:
    UserId;

  readonly tenantId:
    TenantId;

  readonly sessionId:
    SessionId;

  readonly workspaceId:
    WorkspaceId;

  /**
   * Roles and capabilities are projections of the
   * server-policy authorization result already present
   * in IdentityContext.
   *
   * They are not accepted independently from callers.
   */
  readonly roles:
    readonly string[];

  readonly capabilities:
    readonly string[];

  readonly selectedAccount:
    AccountSelection | null;

  readonly selectedWallet:
    WalletSelection | null;

  readonly environment:
    TradingEnvironment;

  readonly authenticationStatus:
    IdentityContext["authentication"]["status"];

  readonly createdAt:
    string;

  readonly lastValidatedAt:
    string;

  /**
   * Explicitly documents that this object is context,
   * not a security authority.
   */
  readonly grantsAuthority:
    false;
};

export type CreateTradingUserContextInput = {
  readonly identityContext:
    IdentityContext;

  readonly workspaceId:
    WorkspaceId;

  readonly selectedAccount?:
    AccountSelection | null;

  readonly selectedWallet?:
    WalletSelection | null;

  readonly environment:
    TradingEnvironment;

  readonly createdAt:
    string;

  readonly lastValidatedAt:
    string;
};

const WORKSPACE_PATTERN =
  /^wsp_[A-Za-z0-9][A-Za-z0-9._:-]{5,159}$/;

function assertTimestamp(
  value: string,
  field: string
): void {
  if (
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

function normalizeOpaqueRef(
  value: string,
  field: string
): string {
  const normalized =
    value.trim();

  if (!normalized) {
    throw new Error(
      `${field} is required.`
    );
  }

  if (
    normalized.includes("@")
  ) {
    throw new Error(
      `${field} must be an opaque internal reference.`
    );
  }

  if (
    /^0x[0-9a-f]{40}$/i.test(
      normalized
    )
  ) {
    throw new Error(
      `${field} must not use a raw wallet address.`
    );
  }

  if (
    normalized.length > 160
  ) {
    throw new Error(
      `${field} exceeds maximum length.`
    );
  }

  return normalized;
}

function normalizeSelection<
  T extends
    AccountSelection |
    WalletSelection
>(
  value: T | null | undefined
): T | null {
  return value ?? null;
}

export function createWorkspaceId(
  value: string
): WorkspaceId {
  const normalized =
    value.trim();

  if (
    !WORKSPACE_PATTERN.test(
      normalized
    )
  ) {
    throw new Error(
      "workspaceId must use canonical wsp_ format."
    );
  }

  return normalized as WorkspaceId;
}

export function createAccountSelection(
  accountRef: string,
  selectedAt: string
): AccountSelection {
  assertTimestamp(
    selectedAt,
    "accountSelection.selectedAt"
  );

  return {
    accountRef:
      normalizeOpaqueRef(
        accountRef,
        "accountSelection.accountRef"
      ),

    selectedAt,
  };
}

export function createWalletSelection(
  walletRef: string,
  selectedAt: string
): WalletSelection {
  assertTimestamp(
    selectedAt,
    "walletSelection.selectedAt"
  );

  return {
    walletRef:
      normalizeOpaqueRef(
        walletRef,
        "walletSelection.walletRef"
      ),

    selectedAt,
  };
}

function projectedRoles(
  context:
    IdentityContext
): readonly string[] {
  if (
    context.authentication.status !==
      "authenticated" ||
    !context.authorization
  ) {
    return [];
  }

  return [
    ...context.authorization.roles,
  ];
}

function projectedCapabilities(
  context:
    IdentityContext
): readonly string[] {
  if (
    context.authentication.status !==
      "authenticated" ||
    !context.authorization
  ) {
    return [];
  }

  return [
    ...context.authorization.capabilities,
  ];
}

export function createTradingUserContext(
  input:
    CreateTradingUserContextInput
): TradingUserContext {
  assertTimestamp(
    input.createdAt,
    "userContext.createdAt"
  );

  assertTimestamp(
    input.lastValidatedAt,
    "userContext.lastValidatedAt"
  );

  if (
    input.identityContext.identity.state !==
    "active"
  ) {
    throw new Error(
      "Disabled identity cannot create an active Trading user context."
    );
  }

  return {
    userId:
      input.identityContext.identity.userId,

    tenantId:
      input.identityContext.identity.tenantId,

    sessionId:
      input.identityContext.sessionId,

    workspaceId:
      input.workspaceId,

    roles:
      projectedRoles(
        input.identityContext
      ),

    capabilities:
      projectedCapabilities(
        input.identityContext
      ),

    selectedAccount:
      normalizeSelection(
        input.selectedAccount
      ),

    selectedWallet:
      normalizeSelection(
        input.selectedWallet
      ),

    environment:
      input.environment,

    authenticationStatus:
      input.identityContext.authentication.status,

    createdAt:
      input.createdAt,

    lastValidatedAt:
      input.lastValidatedAt,

    grantsAuthority:
      false,
  };
}

export function updateTradingUserContextValidation(
  context:
    TradingUserContext,
  lastValidatedAt:
    string
): TradingUserContext {
  assertTimestamp(
    lastValidatedAt,
    "userContext.lastValidatedAt"
  );

  return {
    ...context,
    lastValidatedAt,
  };
}

export function selectTradingAccount(
  context:
    TradingUserContext,
  selection:
    AccountSelection | null
): TradingUserContext {
  return {
    ...context,
    selectedAccount:
      selection,
  };
}

export function selectTradingWallet(
  context:
    TradingUserContext,
  selection:
    WalletSelection | null
): TradingUserContext {
  return {
    ...context,
    selectedWallet:
      selection,
  };
}
