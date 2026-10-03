import type {
  ActivityCenterReadModel,
} from "./types";

export function summarizeActivityCenterReadModel(
  model:
    ActivityCenterReadModel
) {
  return {
    total:
      model.total,

    legacy:
      model.legacyCount,

    unified:
      model.unifiedCount,

    approvalAuthority:
      model.approvalAuthorityCount,

    errors:
      model.items.filter(
        item =>
          item.severity ===
          "ERROR"
      ).length,

    warnings:
      model.items.filter(
        item =>
          item.severity ===
          "WARNING"
      ).length,

    authoritative:
      false as const,
  };
}
