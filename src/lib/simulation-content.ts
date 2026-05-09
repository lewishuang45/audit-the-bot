import {
  flawedAiMemoStatements,
  hiddenAnswerKey,
  issueCategories,
  rubricAnchors,
  sampleBusinessBrief,
  sampleFinalMemo,
  sampleRevisedMemo,
  sampleRevisionPrompt,
} from "../data/sampleLesson";

export { issueCategories, rubricAnchors, sampleFinalMemo };

export const stages = [
  { id: "brief", label: "Brief", minutes: 5 },
  { id: "baseline", label: "Baseline", minutes: 10 },
  { id: "audit", label: "Audit", minutes: 10 },
  { id: "prompt", label: "Prompt", minutes: 10 },
  { id: "revision", label: "Revision", minutes: 10 },
  { id: "final", label: "Final memo", minutes: 15 },
] as const;

export const businessBrief = sampleBusinessBrief;
export const flawedMemoStatements = flawedAiMemoStatements;
export const knownIssues = hiddenAnswerKey;
export const samplePrompt = sampleRevisionPrompt;
export const revisedMemo = sampleRevisedMemo;
