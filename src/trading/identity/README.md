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

## Phase 33C — Wallet Identity Model

Wallet identity is intentionally separate from canonical application identity.

A wallet address is not a `UserId`.

The canonical model contains:

- `WalletIdentity`
- `WalletBinding`
- `WalletAddress`
- `WalletChain`
- `WalletConnection`
- `WalletProof`
- `WalletSignatureEvidence`

### Connection boundary

A wallet connection only describes a transport/session relationship.

`WalletConnection.provesOwnership` is always `false`.

Connecting a browser wallet does not prove ownership by itself.

### Proof boundary

Wallet signature evidence records the result of a challenge-verification
workflow without storing raw signatures in the canonical identity model.

Evidence does not grant authority.

### Binding boundary

An active wallet binding requires verified, unexpired wallet proof and binds:

- canonical user
- canonical tenant
- canonical wallet
- canonical chain

The binding remains scoped application evidence and has
`grantsAuthority = false`.

### Revocation

Wallet bindings are revocable and preserve explicit revocation time and reason.

Revocation does not silently delete historical evidence.

### Not implemented in Phase 33C

This phase performs no:

- browser wallet connection
- MetaMask integration
- WalletConnect integration
- RPC call
- blockchain transaction
- message signing
- signature verification

Those belong to later controlled phases.

## Phase 33D — Wallet Connection Experience

Phase 33D introduces a controlled wallet connection boundary.

UI components do not communicate directly with browser wallet providers.

The canonical flow is:

UI
→ wallet connection controller
→ `WalletConnectorPort`
→ provider adapter

The connector port exposes only:

- request accounts
- read chain
- request chain switch

It exposes no transaction submission or trading execution methods.

### Connection states

The connection domain supports:

- connected
- disconnected
- expired
- unsupported network

Connection remains descriptive session context.

It does not prove ownership and does not grant application authority.

### Chain switching

Chain switching is explicit and verified by reading the provider chain after
the switch request.

Unsupported chains fail closed.

### UI boundary

`WalletConnectionPanel` is intentionally isolated from the Trading Islands
shell during Phase 33D.

This avoids modifying the mobile workspace geometry before Phase 33H device
integration.

The panel receives callbacks and state only; it does not access browser wallet
globals directly.

## Phase 33E — Ownership Evidence

Phase 33E introduces descriptive blockchain ownership read models.

Supported evidence includes:

- native-token balances
- fungible-token balances
- NFT holding observations
- chain and block context
- verification timestamps
- stale evidence state

### Evidence boundary

Ownership evidence is descriptive.

It does not grant application authority.

Every ownership record explicitly carries:

- `grantsAuthority = false`
- `claimsLegalOwnership = false`

Blockchain observations do not automatically represent legal ownership or
application permissions.

### Precision

Token quantities use base-unit decimal integer strings.

Floating-point values are intentionally excluded from the canonical evidence
model.

### Freshness

Ownership evidence can become stale.

Stale evidence must not be interpreted as current chain truth.

### Identity association

Ownership evidence may be associated with a canonical wallet binding, user and
tenant for application context.

That association still does not convert asset holdings into authorization.

### Data source

Phase 33E defines the read model only.

No direct RPC or indexer calls are performed here.

Future adapters should receive blockchain observations through the canonical
Blockchain Gateway or another explicitly approved read boundary.
