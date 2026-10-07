# Redis Cache / Lock Infrastructure

Phase 34I introduces the Redis implementation boundary for `CachePort`.

This phase deliberately does not install or instantiate a concrete Redis
client.

## Boundaries

- Redis is not a source of truth.
- Redis state never grants authorization.
- A lock coordinates work but does not approve work.
- Lock release uses compare-and-delete semantics.
- Locks always require a finite positive TTL.
- Cache health is observational only.
- No trading, blockchain or external execution primitives are exposed.

A concrete Redis driver and server composition belong to the next phase.
