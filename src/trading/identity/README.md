# Trading Islands — Identity Foundation

Phase 33A introduces the canonical identity domain for Trading Islands.

## Canonical boundary

Identity, authentication and authorization are separate concepts.

A canonical user identity consists of opaque internal identifiers:

- `UserId`
- `TenantId`
- `SubjectId`
- `SessionId`

Raw email addresses, usernames, display names and wallet addresses are
not canonical internal identity IDs.

## Runtime session identity

`src/trading/runtime/sessionIdentity.ts` remains the owner of bot/runtime
execution session IDs.

That runtime mechanism is intentionally not replaced by Phase 33A.

Runtime execution identity and canonical application user identity solve
different problems.

## Authentication

Authentication describes whether the canonical subject was authenticated
and with what assurance.

Authentication does not grant arbitrary authority.

## Authorization

Authorization is represented separately through a server-policy result
scoped to the canonical `userId` and `tenantId`.

Client state must not manufacture authorization.

## Evidence

Identity evidence describes observations about a subject.

`IdentityEvidence.grantsAuthority` is permanently `false`.

Evidence is not approval and is not execution authority.

## Storage

This foundation intentionally has no persistence implementation.

In particular:

- `localStorage` is not an authoritative identity store.
- `sessionStorage` is not an authoritative identity store.
- UI state is not a durable identity source.

Durability is introduced through later storage/infrastructure phases.

## Wallet boundary

Wallet identity and wallet bindings belong to Phase 33C.

A wallet address must not be used as `UserId`.

Wallet possession does not imply unrestricted application authority.

## PULSE boundary

Existing PULSE tenant isolation and server authorization contracts remain
canonical within PULSE.

Phase 33A does not duplicate or replace them.

Future integration must adapt canonical Trading identity into the existing
PULSE server boundary rather than allow the client to invent tenant
authority.

## Activity Center

Activity Center remains observational.

Identity activity integration belongs to Phase 33F and must not turn
activity records into authority.

## Phase 33B — Session / User Context

`TradingUserContext` is the operational projection used by Trading Islands.

It contains:

- canonical `userId`
- canonical `tenantId`
- canonical `sessionId`
- `workspaceId`
- roles and capabilities projected from the existing authorization result
- selected account reference
- selected wallet reference
- environment
- validation timestamps

The context accepts no caller-supplied roles or capabilities. They are derived
from the canonical `IdentityContext`.

This prevents UI code from manufacturing authorization by constructing a user
context with arbitrary permissions.

### Selection is not authority

`selectedAccount` and `selectedWallet` are UI/runtime selections.

They do not prove:

- wallet ownership
- account ownership
- application authorization
- blockchain authority
- approval

Phase 33C defines the canonical wallet identity and binding model.

### Storage boundary

`TradingUserContext` has no built-in browser persistence.

It does not read or write:

- `localStorage`
- `sessionStorage`
- IndexedDB

Persistence and recovery are separate infrastructure concerns.
