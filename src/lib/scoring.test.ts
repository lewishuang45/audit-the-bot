import { describe, expect, it } from "vitest";
import {
  calculateDetectedKnownIssues,
  calculateRubricTotal,
  clamp,
} from "./scoring";
import type { AuditMark, RubricScore } from "./types";

describe("scoring", () => {
  it("clamps rubric dimensions before calculating a ten-point total", () => {
    const score: RubricScore = {
      verifyAccuracy: 4,
      modificationQuality: 2,
      guidanceEffectiveness: 3,
      argumentationQuality: 1,
    };

    expect(calculateRubricTotal(score)).toBe(8);
  });

  it("counts known issues only when statement and category match", () => {
    const marks: Record<string, AuditMark> = {
      s2: {
        statementId: "s2",
        decision: "revise",
        category: "factual error",
        note: "The survey says try below HKD 18, not buy.",
      },
      s4: {
        statementId: "s4",
        decision: "question",
        category: "budget mismatch",
        note: "HKD 24 conflicts with price threshold.",
      },
      wrong: {
        statementId: "s8",
        decision: "revise",
        category: "factual error",
        note: "Wrong category should not match the answer key.",
      },
    };

    expect(calculateDetectedKnownIssues(marks)).toBe(2);
  });

  it("clamps invalid values to the allowed range", () => {
    expect(clamp(Number.NaN, 0, 3)).toBe(0);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(5, 0, 3)).toBe(3);
  });
});
