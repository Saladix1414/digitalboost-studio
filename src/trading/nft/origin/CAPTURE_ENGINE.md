# NFT Origin Capture Engine

Phase 24B introduces deterministic mode-aware Origin capture.

## Capture responsibility

The engine converts validated Origin mode profiles into captured Origin records.

Supported modes:

- CLASSIC
- GENERATIVE
- LIVING
- IMPORTED

## Source rules

CLASSIC:

- FORGE workflow -> FORGE source
- MANUAL workflow -> MANUAL source

GENERATIVE:

- GENERATOR source

LIVING:

- FORGE source

IMPORTED:

- IMPORT source

## Boundaries

Capture does not prove:

- provenance
- ownership
- authorship
- authenticity
- blockchain state
- legal rights

All captured records remain:

`authoritative:false`

No RPC, wallet, blockchain gateway or DBX execution exists in this phase.
