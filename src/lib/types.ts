export type Decision = "accept" | "question" | "revise" | "reject";

export type IssueCategory =
  | "factual error"
  | "unsupported claim"
  | "budget mismatch"
  | "target market mismatch"
  | "distribution mismatch"
  | "vague recommendation"
  | "ethical or tone risk"
  | "weak evidence"
  | "missing evidence"
  | "logical weakness"
  | "contradiction with brief";

export type StageId =
  | "join"
  | "brief"
  | "baseline"
  | "audit"
  | "prompt"
  | "revision"
  | "final"
  | "submitted";

export type MemoStatement = {
  id: string;
  text: string;
};

export type KnownIssue = {
  id: string;
  statementId: string;
  category: IssueCategory;
  expectedFinding: string;
};

export type AuditMark = {
  statementId: string;
  decision: Decision;
  category: IssueCategory;
  note: string;
};

export type RubricScore = {
  verifyAccuracy: number;
  modificationQuality: number;
  guidanceEffectiveness: number;
  argumentationQuality: number;
};

export type Submission = {
  id: string;
  participantName: string;
  stage: StageId;
  baseline: string;
  auditMarks: Record<string, AuditMark>;
  prompt: string;
  revisedMemo: string;
  finalMemo: string;
  acceptedRationale: string;
  revisedRationale: string;
  rejectedRationale: string;
  reflection: string;
  score?: RubricScore;
  createdAt: string;
  updatedAt: string;
};

export type ScoreSummary = {
  total: number;
  issueCount: number;
  detectedKnownIssues: number;
  detectionRate: number;
};
