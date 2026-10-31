# Commerce OS backend — Phase 1

This phase adds a PostgreSQL-backed catalog and order ledger behind the existing Commerce OS UI.

## Local setup

1. Start a PostgreSQL instance and provide its URL in `DATABASE_URL`.
2. Set `DIGITALBOOST_INFRA_DATABASE_PROVIDER=postgresql` and `NODE_ENV=development` in the server environment.
3. Run `npm run infra:migrate` once, then start the app with `npm run dev`.
4. The local development principal is scoped to `local-tenant`. Product edits are stored in PostgreSQL; the browser ledger remains as an offline fallback.

When a server snapshot differs from existing browser data, the client keeps local-only records and local values for conflicting IDs. The snapshot is marked `mixed`, and net sales are suppressed until the data is reconciled. This avoids silently replacing the browser ledger with an empty or partial database snapshot.

The app uses the existing infrastructure composition and migration runner. No database credentials are committed.

## API added

- `GET /api/commerce/v1/snapshot` — tenant-scoped products and orders.
- `PUT /api/commerce/v1/products/:id` — create or update a product.
- `DELETE /api/commerce/v1/products/:id` — delete a product.
- `POST /api/commerce/v1/orders` — create an unpaid, unfulfilled order.

Database snapshots are tagged `authoritative: false`. The order endpoint does not accept payment or fulfillment state changes. Those actions need to be routed through authenticated PULSE policy and approval workflows before they can become server-authoritative.

## Authentication boundary

Development uses a fixed `local-tenant` principal. Production requests require trusted middleware to attach `digitalboostPrincipal` (`tenantId` and `actorId`); otherwise the API returns 401. This repository does not yet provide that production identity middleware, so deployment writes remain closed by default.

## Current scope and follow-up

This is a first persistence slice, not a complete commerce integration. Product catalog editing uses the API and falls back to the existing local ledger if PostgreSQL is unavailable. Orders can be read and created through the API, but checkout, payment reconciliation, customer persistence, inventory reservation, and fulfillment workflows remain separate follow-up work. No live PostgreSQL service was available during this implementation, so the migration and endpoint were not exercised against a database.
