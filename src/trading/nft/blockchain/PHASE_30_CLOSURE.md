# Phase 30 — Blockchain Gateway Closure

Phase 30 defines the NFT blockchain execution boundary.

Canonical flow:

READ
→ SIMULATE
→ SEND_PREPARED
→ SUBMITTED
→ VERIFIED
→ INDEXED
→ RETRY / FALLBACK

## 30A — Foundation

Defined:

- gateway stages
- request contracts
- state machine
- failure vocabulary
- deterministic simulation boundary

## 30B — Simulation + Send Preparation

Defined:

- structured simulation checks
- send preparation
- request binding
- signing requirement declaration
- transactionSubmitted:false

## 30C — Submission / Verification / Indexing Evidence

Defined deterministic fixture evidence for:

- SUBMITTED
- VERIFIED
- INDEXED

These are evidence records, not live-chain claims.

## 30D — Retry / Fallback

Adds:

- bounded retry policy
- retry decision
- fallback decision
- fallback record
- recovery orchestration

## Critical boundaries

Simulation != execution

SEND_PREPARED != sent

SUBMITTED != settled

VERIFIED != ownership

INDEXED != authority

Retry != approval

Fallback != execution

No live blockchain client is connected in Phase 30.

No ethers.

No viem.

No wagmi.

No RPC.

No wallet signing.

No raw transaction submission.

All outputs remain:

`authoritative:false`

Phase 31 owns DBX Ledger semantics and must not reinterpret gateway evidence as financial authority.
