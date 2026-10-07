/**
 * DigitalBoost Studio — Trading Islands
 * PHASE 33A — Canonical Identity Foundation
 *
 * AUTHORITY RULES
 *
 * Identity            != authentication
 * Authentication      != authorization
 * Session context     != authority
 * Identity evidence   != authority
 * Wallet possession   != canonical user identity
 * Client state        != durable identity
 */

declare const identityBrand:
  unique symbol;

export type BrandedIdentityId<
  Kind extends string,
> = string & {
  readonly [identityBrand]: Kind;
};

export type UserId =
  BrandedIdentityId<"UserId">;

export type TenantId =
  BrandedIdentityId<"TenantId">;

export type SubjectId =
  BrandedIdentityId<"SubjectId">;

export type SessionId =
  BrandedIdentityId<"SessionId">;

export type IdentityEvidenceId =
  BrandedIdentityId<"IdentityEvidenceId">;

export type IdentitySource =
  | "internal"
  | "server-session"
  | "federated"
  | "service"
  | "migration"
  | "test";

export type AuthenticationAssurance =
  | "low"
  | "standard"
  | "strong";

export type AuthenticationState =
  | {
      readonly status:
        "unauthenticated";

      readonly checkedAt:
        string;
    }
  | {
      readonly status:
        "authenticated";

      readonly subjectId:
        SubjectId;

      readonly authenticatedAt:
        string;

      readonly checkedAt:
        string;

      readonly expiresAt?:
        string;

      readonly assurance:
        AuthenticationAssurance;
    }
  | {
      readonly status:
        "stale";

      readonly subjectId?:
        SubjectId;

      readonly checkedAt:
        string;

      readonly reason:
        string;
    }
  | {
      readonly status:
        "expired";

      readonly subjectId?:
        SubjectId;

      readonly checkedAt:
        string;

      readonly expiredAt:
        string;
    };

export type AuthorizationContext = {
  /**
   * Authorization is always scoped back to
   * canonical identity.
   *
   * This object describes a policy result.
   * It does not authenticate the caller.
   */
  readonly userId:
    UserId;

  readonly tenantId:
    TenantId;

  readonly roles:
    readonly string[];

  readonly capabilities:
    readonly string[];

  readonly evaluatedAt:
    string;

  readonly policyVersion:
    string;

  readonly authoritySource:
    "server-policy";
};

export type IdentityEvidence = {
  readonly evidenceId:
    IdentityEvidenceId;

  readonly source:
    IdentitySource;

  readonly subjectId:
    SubjectId;

  readonly observedAt:
    string;

  readonly verifiedAt?:
    string;

  readonly expiresAt?:
    string;

  readonly assertions:
    readonly string[];

  /**
   * Evidence describes facts.
   *
   * Evidence itself never grants application
   * authority.
   */
  readonly grantsAuthority:
    false;
};

export type UserIdentity = {
  readonly userId:
    UserId;

  readonly tenantId:
    TenantId;

  readonly subjectId:
    SubjectId;

  readonly source:
    IdentitySource;

  readonly state:
    "active" | "disabled";

  readonly createdAt:
    string;
};

export type IdentityContext = {
  readonly identity:
    UserIdentity;

  readonly sessionId:
    SessionId;

  readonly authentication:
    AuthenticationState;

  readonly authorization:
    AuthorizationContext | null;

  readonly evidence:
    readonly IdentityEvidence[];

  readonly lastValidatedAt:
    string;
};
