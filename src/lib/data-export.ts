import { summarizeSubmission } from "./scoring";
import type { Submission } from "./types";

export type AnalyticsRow = {
  id: string;
  participant: string;
  stage: string;
  baseline_word_count: number;
  audit_mark_count: number;
  known_issue_count: number;
  detection_rate: number;
  prompt_word_count: number;
  final_word_count: number;
  VerifyAccuracy: number;
  ModificationQuality: number;
  GuidanceEffectiveness: number;
  ArgumentationQuality: number;
  TotalScore: number;
  Individual: number;
  AI: number;
  CoachedAI: number;
  AugPair: number;
  Team: number;
  AugT: number;
};

const baselineKeywords = [
  "yuzu",
  "price",
  "hkd",
  "campus",
  "booth",
  "student",
  "budget",
  "refreshment",
];

const promptKeywords = [
  "brief",
  "unsupported",
  "budget",
  "distribution",
  "price",
  "target",
  "tone",
  "claim",
  "evidence",
  "format",
];

const finalKeywords = [
  "yuzu",
  "hkd",
  "campus",
  "ambassador",
  "sampling",
  "short-form",
  "distribution",
  "budget",
  "claim",
];

export function toAnalyticsRows(submissions: Submission[]): AnalyticsRow[] {
  return submissions.map((submission, index) => {
    const summary = summarizeSubmission(submission);
    const individual = estimateTextScore(submission.baseline, baselineKeywords);
    const coachedAi = estimatePromptScore(submission.prompt, summary.detectionRate);
    const augPair =
      summary.total > 0
        ? summary.total * 10
        : estimateTextScore(submission.finalMemo, finalKeywords);

    return {
      id: String(index + 1),
      participant: submission.participantName,
      stage: submission.stage,
      baseline_word_count: countWords(submission.baseline),
      audit_mark_count: summary.issueCount,
      known_issue_count: summary.detectedKnownIssues,
      detection_rate: summary.detectionRate,
      prompt_word_count: countWords(submission.prompt),
      final_word_count: countWords(submission.finalMemo),
      VerifyAccuracy: submission.score?.verifyAccuracy ?? 0,
      ModificationQuality: submission.score?.modificationQuality ?? 0,
      GuidanceEffectiveness: submission.score?.guidanceEffectiveness ?? 0,
      ArgumentationQuality: submission.score?.argumentationQuality ?? 0,
      TotalScore: summary.total,
      Individual: individual,
      AI: 35,
      CoachedAI: coachedAi,
      AugPair: augPair,
      Team: summary.detectionRate,
      AugT: Math.round((coachedAi + augPair) / 2),
    };
  });
}

export function toAnalyticsCsv(submissions: Submission[]): string {
  const rows = toAnalyticsRows(submissions);
  const headers = [
    "id",
    "participant",
    "stage",
    "baseline_word_count",
    "audit_mark_count",
    "known_issue_count",
    "detection_rate",
    "prompt_word_count",
    "final_word_count",
    "VerifyAccuracy",
    "ModificationQuality",
    "GuidanceEffectiveness",
    "ArgumentationQuality",
    "TotalScore",
    "Individual",
    "AI",
    "CoachedAI",
    "AugPair",
    "Team",
    "AugT",
  ] satisfies Array<keyof AnalyticsRow>;

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
}

export function createBtbWorkflowSchema() {
  return {
    input_file: "datasets/audit_the_bot_analytics.csv",
    id_column: "id",
    id_strategy: "existing",
    ranking_column: "AugPair",
    metric_columns: ["Individual", "AI", "CoachedAI", "AugPair"],
    drop_columns: ["Team", "AugT"],
    group_labels: ["top", "average", "bottom"],
  };
}

export function createBtbWorkflowTemplate() {
  return {
    template_id: "audit_the_bot_learning_analysis",
    name: "Audit the Bot Learning Analysis",
    description:
      "Compare student performance across human-only baseline, flawed AI reference, coached AI revision, and final human-AI edited memo.",
    report_system_prompt:
      "You are a learning analytics strategist. Always return strict JSON only.",
    outline_system_prompt:
      "You are a business presentation strategist. Always return strict JSON only.",
    report_prompt_keys: ["prompt_1", "prompt_2"],
    outline_prompt_keys: ["prompt_3"],
    image_prompt_keys: ["prompt_4"],
    expected_fields: [
      "Individual",
      "AI",
      "CoachedAI",
      "AugPair",
      "detection_rate",
      "TotalScore",
    ],
    recommended_schema: createBtbWorkflowSchema(),
  };
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateTextScore(text: string, keywords: string[]): number {
  if (!text.trim()) {
    return 0;
  }

  const lower = text.toLowerCase();
  const keywordHits = keywords.filter((keyword) => lower.includes(keyword)).length;
  const lengthScore = Math.min(countWords(text) * 1.5, 45);
  const keywordScore = (keywordHits / keywords.length) * 55;

  return Math.round(Math.min(lengthScore + keywordScore, 100));
}

export function estimatePromptScore(prompt: string, detectionRate: number): number {
  if (!prompt.trim()) {
    return 0;
  }

  const promptQuality = estimateTextScore(prompt, promptKeywords);
  return Math.round(promptQuality * 0.65 + detectionRate * 0.35);
}

function csvEscape(value: string | number): string {
  const text = String(value);
  if (!/[",\n\r]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll("\"", "\"\"")}"`;
}
