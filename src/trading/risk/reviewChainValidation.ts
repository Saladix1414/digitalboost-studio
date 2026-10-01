import type {
  RiskReviewHistory,
  RiskReviewHistoryEntry,
} from "./reviewHistory";

import {
  validateRiskReviewProvenance,
} from "./reviewProvenanceValidation";

export type RiskReviewChainIntegrityIssueCode =
  | "empty-history"
  | "root-version-invalid"
  | "root-supersedes-invalid"
  | "version-gap"
  | "duplicate-version"
  | "supersedes-mismatch"
  | "provenance-invalid";

export type RiskReviewChainIntegrityIssue = {
  readonly code:
    RiskReviewChainIntegrityIssueCode;

  readonly index:
    number;

  readonly reviewId:
    string | null;

  readonly detail:
    string;
};

export type RiskReviewChainIntegrity = {
  readonly valid:
    boolean;

  readonly checkedEntries:
    number;

  readonly issues:
    readonly RiskReviewChainIntegrityIssue[];

  readonly authoritative:
    false;
};

function createIssue(
  code:
    RiskReviewChainIntegrityIssueCode,

  index:
    number,

  entry:
    RiskReviewHistoryEntry | null,

  detail:
    string
): RiskReviewChainIntegrityIssue {
  return {
    code,

    index,

    reviewId:
      entry
        ? entry.versionedReview.review.id
        : null,

    detail,
  };
}

export function validateRiskReviewChain(
  history:
    RiskReviewHistory
): RiskReviewChainIntegrity {
  const entries =
    history.entries;

  const issues:
    RiskReviewChainIntegrityIssue[] =
      [];

  if (
    entries.length ===
    0
  ) {
    issues.push(
      createIssue(
        "empty-history",
        0,
        null,
        "Review history contains no entries."
      )
    );

    return {
      valid:
        false,

      checkedEntries:
        0,

      issues,

      authoritative:
        false,
    };
  }

  const root =
    entries[0];

  if (
    root.versionedReview.version !==
    1
  ) {
    issues.push(
      createIssue(
        "root-version-invalid",
        0,
        root,
        `Root review must be version 1, received version ${root.versionedReview.version}.`
      )
    );
  }

  if (
    root.versionedReview.previousReviewId !==
    null ||
    root.provenance.supersedes !==
    null
  ) {
    issues.push(
      createIssue(
        "root-supersedes-invalid",
        0,
        root,
        "Root review must not supersede another review."
      )
    );
  }

  const seenVersions =
    new Set<number>();

  entries.forEach(
    (
      entry,
      index
    ) => {
      const version =
        entry.versionedReview.version;

      if (
        seenVersions.has(
          version
        )
      ) {
        issues.push(
          createIssue(
            "duplicate-version",
            index,
            entry,
            `Review version ${version} appears more than once.`
          )
        );
      }

      seenVersions.add(
        version
      );

      const provenanceIntegrity =
        validateRiskReviewProvenance(
          entry
        );

      if (
        !provenanceIntegrity.valid
      ) {
        issues.push(
          createIssue(
            "provenance-invalid",
            index,
            entry,
            `Invalid provenance: ${provenanceIntegrity.issues.join(", ")}.`
          )
        );
      }

      if (
        index ===
        0
      ) {
        return;
      }

      const previous =
        entries[
          index -
          1
        ];

      const expectedVersion =
        previous.versionedReview.version +
        1;

      if (
        version !==
        expectedVersion
      ) {
        issues.push(
          createIssue(
            "version-gap",
            index,
            entry,
            `Expected version ${expectedVersion}, received version ${version}.`
          )
        );
      }

      const expectedPreviousReviewId =
        previous.versionedReview.review.id;

      if (
        entry.versionedReview.previousReviewId !==
          expectedPreviousReviewId ||
        entry.provenance.supersedes !==
          expectedPreviousReviewId
      ) {
        issues.push(
          createIssue(
            "supersedes-mismatch",
            index,
            entry,
            `Expected supersedes ${expectedPreviousReviewId}.`
          )
        );
      }
    }
  );

  return {
    valid:
      issues.length ===
      0,

    checkedEntries:
      entries.length,

    issues,

    authoritative:
      false,
  };
}
