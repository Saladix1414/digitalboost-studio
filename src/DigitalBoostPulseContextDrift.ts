import type { PulseProposalBinding } from "./DigitalBoostPulseContracts";
import { getActionContract } from "./DigitalBoostPulseContracts";
import { currentContextVersion } from "./DigitalBoostPulseContext";

export type PulseContextDriftStatus =
  "MATCH" | "DRIFT" | "UNAVAILABLE";

export type PulseContextDriftResult = {
  relevant: boolean;
  status: PulseContextDriftStatus;
  expectedContextVersion?: string;
  currentContextVersion?: string;
  store?: string;
  section?: string;
};

function targetParts(target: string): {
  store?: string;
  section?: string;
} {
  const first = target.indexOf(":");
  const last = target.lastIndexOf(":");

  if (first < 1 || last <= first) return {};

  return {
    store: target.slice(0, first),
    section: target.slice(first + 1, last) || undefined,
  };
}

export function checkPulseContextDrift(
  binding: PulseProposalBinding | undefined,
  action: string,
): PulseContextDriftResult {
  if (getActionContract(action)?.class !== "mutate") {
    return {
      relevant: false,
      status: "MATCH",
    };
  }

  if (!binding?.context_version) {
    return {
      relevant: true,
      status: "UNAVAILABLE",
    };
  }

  const parts = targetParts(binding.target);
  const store = parts.store || binding.tenant;
  const section = parts.section;

  try {
    const current = currentContextVersion({
      store,
      section,
    });

    return {
      relevant: true,
      status:
        current === binding.context_version
          ? "MATCH"
          : "DRIFT",
      expectedContextVersion:
        binding.context_version,
      currentContextVersion: current,
      store,
      section,
    };
  } catch {
    return {
      relevant: true,
      status: "UNAVAILABLE",
      expectedContextVersion:
        binding.context_version,
      store,
      section,
    };
  }
}
