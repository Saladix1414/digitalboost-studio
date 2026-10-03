import type {
  ActivityCenterReadFilter,
  ActivityCenterReadModel,
} from "./types";

export function queryActivityCenterReadModel(
  model:
    ActivityCenterReadModel,

  filter:
    ActivityCenterReadFilter = {}
) {
  return model.items.filter(
    item => {
      if (
        filter.sourceModel &&
        item.sourceModel !==
          filter.sourceModel
      ) {
        return false;
      }

      if (
        filter.domain &&
        item.domain !==
          filter.domain
      ) {
        return false;
      }

      if (
        filter.authority &&
        item.authority !==
          filter.authority
      ) {
        return false;
      }

      if (
        filter.severity &&
        item.severity !==
          filter.severity
      ) {
        return false;
      }

      if (
        filter.referenceRef &&
        !item.references.some(
          reference =>
            reference.ref ===
            filter.referenceRef
        )
      ) {
        return false;
      }

      return true;
    }
  );
}
