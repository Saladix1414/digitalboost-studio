import type {
  PulseExecutionClaim,
  PulseExecutionClaimStore,
} from "../../src/DigitalBoostPulseExecutionLedger";

export type AtomicClaimHarness = {
  store: PulseExecutionClaimStore;
  claims: Map<string, PulseExecutionClaim>;
  reset(): void;
};

export function createAtomicClaimStore(): AtomicClaimHarness {
  const claims = new Map<
    string,
    PulseExecutionClaim
  >();

  const store: PulseExecutionClaimStore = {
    atomic: true,

    claim(claim) {
      if (claims.has(claim.approval_id)) {
        return {
          claimed: false,
          reason: "ALREADY_CLAIMED",
        };
      }

      claims.set(
        claim.approval_id,
        claim,
      );

      return {
        claimed: true,
        claim,
      };
    },
  };

  return {
    store,
    claims,
    reset() {
      claims.clear();
    },
  };
}
