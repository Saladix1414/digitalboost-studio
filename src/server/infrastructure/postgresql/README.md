# PostgreSQL Infrastructure Adapter

Phase 34E introduces the PostgreSQL implementation boundary for
`DatabasePort`.

This phase intentionally does not install or instantiate a concrete `pg`
client. The adapter accepts a structural pool contract so transaction,
query, mutation and health semantics can be validated independently.

## Boundaries

- PostgreSQL does not grant authorization.
- PostgreSQL does not become product authority.
- Generic mutations cannot silently claim optimistic concurrency.
- A non-null `expectedVersion` fails closed.
- Read-only transactions reject mutation.
- Failed transactions attempt rollback.
- Database errors do not expose secrets through health metadata.
- No trading, blockchain or external execution primitive exists here.

A concrete PostgreSQL driver and connection bootstrap belong to the next
infrastructure integration step.
