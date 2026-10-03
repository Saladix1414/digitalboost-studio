# Phase 32D — Activity Center Read Model

The Activity Center read model combines two compatible activity representations:

1. Historical `TradingActivityItem`
2. Phase 32 `TradingActivityEvent`

It does not replace either model.

## Historical evidence

Historical activity includes:

- strategy
- risk review
- runtime
- paper ledger
- recovery
- remote retry

Historical `TradingActivityItem` does not contain a timestamp.

The read model therefore uses:

`occurredAt: null`

It must never manufacture a timestamp.

## Unified activity

Phase 32 events preserve:

- domain
- actor
- references
- occurredAt
- severity
- sequence

Unified events remain observational.

## Authority

Historical risk-review items may preserve:

`authority: "approval"`

because that authority belongs to the underlying Risk Review evidence.

The Activity Center itself never creates approval authority.

Unified events always project as:

`authority: "none"`

Activity visibility != authority.
