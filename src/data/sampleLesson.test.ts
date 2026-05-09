import { describe, expect, it } from "vitest";
import { sampleLesson } from "./sampleLesson";

describe("sample lesson pack", () => {
  it("keeps the hidden answer key aligned to flawed memo statements", () => {
    const statementIds = new Set(
      sampleLesson.flawedAiMemoStatements.map((statement) => statement.id),
    );

    expect(sampleLesson.hiddenAnswerKey.length).toBeGreaterThan(0);
    expect(
      sampleLesson.hiddenAnswerKey.every((issue) =>
        statementIds.has(issue.statementId),
      ),
    ).toBe(true);
  });

  it("defines a ten-point rubric", () => {
    const total = sampleLesson.rubricAnchors.reduce(
      (sum, rubric) => sum + rubric.max,
      0,
    );

    expect(total).toBe(10);
  });
});
