# Marketplace Discovery UX

Phase 27C hardens the product-facing discovery experience.

## Added behavior

- deterministic card selection
- deselect on repeated selection
- selected listing state
- featured-only discovery
- price quick filter
- collection quick filters
- active quick-filter state
- visual selected-card state

## Selection boundary

Selection is local UI state only.

It does not mean:

- reservation
- purchase intent
- order creation
- ownership
- wallet approval
- payment
- blockchain execution

Selection remains:

`authoritative:false`

Asset detail routing remains reserved for Phase 28.
