import { describe, expect, it } from "vitest";
import {
  createBtbWorkflowSchema,
  estimatePromptScore,
  toAnalyticsCsv,
  toAnalyticsRows,
} from "./data-export";
import type { Submission } from "./types";

const baseSubmission: Submission = {
  id: "s1",
  participantName: "Student One",
  stage: "submitted",
  baseline:
    "Launch Yuzu Green Tea under HKD 18 with campus booth sampling and student ambassadors.",
  auditMarks: {
    s2: {
      statementId: "s2",
      decision: "revise",
      category: "factual error",
      note: "64% said try below HKD 18, not buy.",
    },
  },
  prompt:
    "Rewrite using only the brief, remove unsupported claims, respect budget, distribution, target, evidence, tone, and output format.",
  revisedMemo: "Revised memo",
  finalMemo:
    "Launch Yuzu at HKD 16-18 through campus sampling, ambassadors, and targeted short-form content. Avoid concentration claims.",
  acceptedRationale: "Accepted limited uniqueness discussion.",
  revisedRationale: "Revised social content scope.",
  rejectedRationale: "Rejected convenience stores and productivity claims.",
  reflection: "The price issue was easy to miss.",
  score: {
    verifyAccuracy: 2,
    modificationQuality: 3,
    guidanceEffectiveness: 2,
    argumentationQuality: 2,
  },
  createdAt: "2026-05-08T00:00:00.000Z",
  updatedAt: "2026-05-08T00:00:00.000Z",
};

describe("data export", () => {
  it("creates BTBworkflow-compatible metric columns", () => {
    const [row] = toAnalyticsRows([baseSubmission]);

    expect(row).toMatchObject({
      id: "1",
      participant: "Student One",
      AI: 35,
      AugPair: 90,
      TotalScore: 9,
    });
    expect(row.Individual).toBeGreaterThan(0);
    expect(row.CoachedAI).toBeGreaterThan(0);
  });

  it("exports CSV with default workflow metric headers", () => {
    const csv = toAnalyticsCsv([baseSubmission]);

    expect(csv.split("\n")[0]).toContain("Individual,AI,CoachedAI,AugPair");
    expect(csv).toContain("Student One");
  });

  it("creates a schema consumable by BTBworkflow", () => {
    expect(createBtbWorkflowSchema()).toMatchObject({
      input_file: "datasets/audit_the_bot_analytics.csv",
      ranking_column: "AugPair",
      metric_columns: ["Individual", "AI", "CoachedAI", "AugPair"],
    });
  });

  it("blends prompt quality and known issue detection", () => {
    expect(estimatePromptScore("make it better", 0)).toBeGreaterThan(0);
    expect(
      estimatePromptScore(
        "Use the brief, evidence, budget, distribution, target, tone, and output format.",
        80,
      ),
    ).toBeGreaterThan(60);
  });
});
