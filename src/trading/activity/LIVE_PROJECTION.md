# Phase 32E — Shared Activity Store + Live Domain Projection

The Activity Center now has a shared in-memory event store.

## Flow

Domain evidence
→ existing Phase 32 adapter
→ live projector
→ shared activity store
→ React `useSyncExternalStore`
→ Activity Center unified read model

## Shared store

The store exposes:

- subscribe
- get
- record one event
- record multiple events
- next sequence
- test reset

Exact replay remains idempotent.

## Live projectors

Current projectors support:

- DBX consumption posting
- DBX marketplace settlement
- blockchain submission
- blockchain verification
- blockchain indexing
- blockchain gateway state
- NFT marketplace lifecycle

## Important boundary

Projectors consume evidence that already exists.

They must not execute the underlying domain operation.

Activity projection != domain mutation.

Activity projection != DBX posting.

Activity projection != marketplace settlement.

Activity projection != blockchain submission.

Activity projection != approval.

Activity projection != authority.

All unified events remain `authoritative: false`.

## Persistence

Phase 32E intentionally establishes the shared memory-first projection path first.

Persistence is not required for activity to become execution authority and must never gate domain operations.
