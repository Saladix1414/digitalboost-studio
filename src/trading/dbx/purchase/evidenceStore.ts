import type {
  DbxPaymentEvidence,
  DbxPaymentEvidenceStore,
} from "./types";

export function createDbxPaymentEvidenceStore():
  DbxPaymentEvidenceStore {
  return {
    evidence:
      [],
  };
}

function externalReference(
  evidence:
    DbxPaymentEvidence
): string {
  if (
    evidence.kind ===
      "FIAT"
  ) {
    return [
      evidence.kind,
      evidence.providerRef,
      evidence.settlementRef,
    ].join(":");
  }

  return [
    evidence.kind,
    evidence.chainRef,
    evidence.txHash,
  ].join(":");
}

export function addDbxPaymentEvidence(
  store:
    DbxPaymentEvidenceStore,
  evidence:
    DbxPaymentEvidence
): DbxPaymentEvidenceStore {
  if (
    store.evidence.some(
      (candidate) =>
        candidate.id ===
        evidence.id
    )
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_DUPLICATE_ID"
    );
  }

  const incomingExternalRef =
    externalReference(
      evidence
    );

  const replay =
    store.evidence.some(
      (candidate) =>
        externalReference(
          candidate
        ) ===
        incomingExternalRef
    );

  if (replay) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_REPLAY_DETECTED"
    );
  }

  return {
    evidence: [
      ...store.evidence,
      evidence,
    ],
  };
}
