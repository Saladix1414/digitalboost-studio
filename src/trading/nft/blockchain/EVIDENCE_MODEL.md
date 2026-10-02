# Phase 30C — Submission / Verification / Indexing Evidence

Phase 30C defines deterministic blockchain evidence contracts.

Pipeline:

SEND_PREPARED
→ SUBMITTED
→ VERIFIED
→ INDEXED

## Submission evidence

Submission evidence records:

- request reference
- transaction hash
- chain reference
- submission timestamp
- fixture source

It does not prove that a live blockchain accepted a transaction.

## Verification evidence

Verification checks:

- request binding
- chain binding
- transaction hash presence
- block reference presence

Verification in 30C is deterministic fixture evidence.

It is not a live RPC receipt check.

## Index evidence

Index evidence records a stable local index reference after successful verification.

Indexing does not create ownership authority.

## Authority boundary

SUBMITTED != settled

VERIFIED != legal ownership

INDEXED != absolute provenance truth

TX hash != payment proof

BLOCK reference != governance approval

All records remain:

`authoritative:false`

No live RPC exists in Phase 30C.
