import type {
  DbxPaymentVerification,
} from "./types";

export type DbxPaymentVerificationStore = {
  readonly verifications:
    readonly DbxPaymentVerification[];
};

export function createDbxPaymentVerificationStore():
  DbxPaymentVerificationStore {
  return {
    verifications:
      [],
  };
}

export function addDbxPaymentVerification(
  store:
    DbxPaymentVerificationStore,
  verification:
    DbxPaymentVerification
): DbxPaymentVerificationStore {
  if (
    store.verifications.some(
      (candidate) =>
        candidate.id ===
        verification.id
    )
  ) {
    throw new Error(
      "DBX_PAYMENT_VERIFICATION_DUPLICATE_ID"
    );
  }

  const existingForEvidence =
    store.verifications.find(
      (candidate) =>
        candidate.evidenceId ===
        verification.evidenceId
    );

  if (existingForEvidence) {
    throw new Error(
      "DBX_PAYMENT_VERIFICATION_EVIDENCE_ALREADY_PROCESSED"
    );
  }

  return {
    verifications: [
      ...store.verifications,
      verification,
    ],
  };
}
