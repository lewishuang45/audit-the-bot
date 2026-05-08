import { knownIssues } from "./simulation-content";
import type { AuditMark, RubricScore, ScoreSummary, Submission } from "./types";

export function calculateRubricTotal(score?: RubricScore): number {
  if (!score) {
    return 0;
  }

  return (
    clamp(score.verifyAccuracy, 0, 3) +
    clamp(score.modificationQuality, 0, 3) +
    clamp(score.guidanceEffectiveness, 0, 2) +
    clamp(score.argumentationQuality, 0, 2)
  );
}

export function calculateDetectedKnownIssues(
  auditMarks: Record<string, AuditMark>,
): number {
  const marks = Object.values(auditMarks);

  return knownIssues.filter((issue) =>
    marks.some(
      (mark) =>
        mark.statementId === issue.statementId &&
        mark.category === issue.category &&
        mark.decision !== "accept",
    ),
  ).length;
}

export function summarizeSubmission(submission: Submission): ScoreSummary {
  const detectedKnownIssues = calculateDetectedKnownIssues(
    submission.auditMarks,
  );

  return {
    total: calculateRubricTotal(submission.score),
    issueCount: Object.keys(submission.auditMarks).length,
    detectedKnownIssues,
    detectionRate: knownIssues.length
      ? Math.round((detectedKnownIssues / knownIssues.length) * 100)
      : 0,
  };
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}
