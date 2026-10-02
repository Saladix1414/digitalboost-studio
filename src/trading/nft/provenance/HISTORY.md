# NFT Provenance History

Phase 25B adds append-only provenance history.

Each history entry records deterministic snapshot hashes for:

- evidence
- links
- full provenance record

## History behavior

The history:

- starts at version 1
- links each entry to the previous entry
- rejects no-op revisions
- records revision reason
- remains append-only
- remains non-authoritative

## Revision reasons

- INITIAL_ASSEMBLY
- EVIDENCE_ADDED
- LINK_ADDED
- EVIDENCE_AND_LINKS_UPDATED
- ARCHIVED

## Security boundary

History integrity does not mean absolute truth.

A consistent history proves only that the modeled record chain is internally consistent.

It does not automatically establish:

- legal ownership
- authorship
- authenticity
- blockchain finality
- real-world identity
- governance authority

All entries remain:

`authoritative:false`
