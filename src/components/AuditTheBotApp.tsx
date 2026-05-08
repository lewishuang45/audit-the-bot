"use client";

import {
  BarChart3,
  Check,
  ClipboardCheck,
  Download,
  FileText,
  ListChecks,
  PencilLine,
  Play,
  RefreshCw,
  Save,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  businessBrief,
  flawedMemoStatements,
  issueCategories,
  revisedMemo,
  rubricAnchors,
  sampleFinalMemo,
  samplePrompt,
  stages,
} from "@/lib/simulation-content";
import { knownIssues } from "@/lib/simulation-content";
import {
  createBtbWorkflowSchema,
  createBtbWorkflowTemplate,
  toAnalyticsCsv,
} from "@/lib/data-export";
import { calculateRubricTotal, summarizeSubmission } from "@/lib/scoring";
import type {
  AuditMark,
  IssueCategory,
  RubricScore,
  StageId,
  Submission,
} from "@/lib/types";

type Mode = "student" | "instructor";

const storageKey = "audit-the-bot-submissions-v1";

const stageOrder: StageId[] = [
  "join",
  "brief",
  "baseline",
  "audit",
  "prompt",
  "revision",
  "final",
  "submitted",
];

const defaultScore: RubricScore = {
  verifyAccuracy: 0,
  modificationQuality: 0,
  guidanceEffectiveness: 0,
  argumentationQuality: 0,
};

export function AuditTheBotApp() {
  const [mode, setMode] = useState<Mode>("student");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [joinName, setJoinName] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    void loadSubmissions();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(submissions));
  }, [submissions]);

  async function loadSubmissions() {
    try {
      const response = await fetch("/api/submissions", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load server submissions.");
      }
      const parsed = (await response.json()) as Submission[];
      setSubmissions(parsed);
      setActiveId((current) => current ?? parsed[0]?.id ?? null);
      setSelectedSubmissionId((current) => current ?? parsed[0]?.id ?? null);
    } catch {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Submission[];
        setSubmissions(parsed);
        setActiveId(parsed[0]?.id ?? null);
        setSelectedSubmissionId(parsed[0]?.id ?? null);
      }
    }
  }

  const activeSubmission = useMemo(
    () => submissions.find((submission) => submission.id === activeId) ?? null,
    [activeId, submissions],
  );

  const selectedSubmission = useMemo(
    () =>
      submissions.find((submission) => submission.id === selectedSubmissionId) ??
      submissions[0] ??
      null,
    [selectedSubmissionId, submissions],
  );

  function createParticipant() {
    const name = joinName.trim() || `Participant ${submissions.length + 1}`;
    const now = new Date().toISOString();
    const submission: Submission = {
      id: crypto.randomUUID(),
      participantName: name,
      stage: "brief",
      baseline: "",
      auditMarks: {},
      prompt: "",
      revisedMemo: "",
      finalMemo: "",
      acceptedRationale: "",
      revisedRationale: "",
      rejectedRationale: "",
      reflection: "",
      createdAt: now,
      updatedAt: now,
    };

    setSubmissions((current) => [submission, ...current]);
    setActiveId(submission.id);
    setSelectedSubmissionId(submission.id);
    setJoinName("");
    void fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
  }

  function updateSubmission(id: string, patch: Partial<Submission>) {
    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === id
          ? { ...submission, ...patch, updatedAt: new Date().toISOString() }
          : submission,
      ),
    );
    void fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  function updateActive(patch: Partial<Submission>) {
    if (!activeSubmission) {
      return;
    }

    updateSubmission(activeSubmission.id, patch);
  }

  function moveActiveTo(stage: StageId) {
    updateActive({ stage });
  }

  function resetLocalData() {
    setSubmissions([]);
    setActiveId(null);
    setSelectedSubmissionId(null);
    window.localStorage.removeItem(storageKey);
    void fetch("/api/submissions", { method: "DELETE" });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MSBA 7041 Simulation</p>
          <h1>Audit the Bot</h1>
        </div>
        <div className="mode-switch" aria-label="Workspace mode">
          <button
            className={mode === "student" ? "active" : ""}
            onClick={() => setMode("student")}
            type="button"
          >
            <PencilLine size={16} />
            Student
          </button>
          <button
            className={mode === "instructor" ? "active" : ""}
            onClick={() => setMode("instructor")}
            type="button"
          >
            <BarChart3 size={16} />
            Instructor
          </button>
        </div>
      </header>

      {mode === "student" ? (
        <StudentWorkspace
          activeSubmission={activeSubmission}
          createParticipant={createParticipant}
          joinName={joinName}
          moveActiveTo={moveActiveTo}
          setJoinName={setJoinName}
          updateActive={updateActive}
        />
      ) : (
        <InstructorWorkspace
          resetLocalData={resetLocalData}
          reloadSubmissions={loadSubmissions}
          selectedSubmission={selectedSubmission}
          selectedSubmissionId={selectedSubmissionId}
          setSelectedSubmissionId={setSelectedSubmissionId}
          submissions={submissions}
          updateSubmission={updateSubmission}
        />
      )}
    </main>
  );
}

function StudentWorkspace({
  activeSubmission,
  createParticipant,
  joinName,
  moveActiveTo,
  setJoinName,
  updateActive,
}: {
  activeSubmission: Submission | null;
  createParticipant: () => void;
  joinName: string;
  moveActiveTo: (stage: StageId) => void;
  setJoinName: (value: string) => void;
  updateActive: (patch: Partial<Submission>) => void;
}) {
  if (!activeSubmission) {
    return (
      <section className="join-layout">
        <div className="panel intro-panel">
          <p className="eyebrow">Session {businessBrief.sessionCode}</p>
          <h2>{businessBrief.title}</h2>
          <p>{businessBrief.task}</p>
          <div className="join-form">
            <label htmlFor="participantName">Participant name</label>
            <input
              id="participantName"
              onChange={(event) => setJoinName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  createParticipant();
                }
              }}
              placeholder="e.g. Lewis"
              value={joinName}
            />
            <button className="primary" onClick={createParticipant} type="button">
              <UserPlus size={16} />
              Join Session
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-grid">
      <aside className="stage-rail" aria-label="Simulation stages">
        <div className="participant-chip">{activeSubmission.participantName}</div>
        {stages.map((stage) => {
          const isVisited =
            stageOrder.indexOf(activeSubmission.stage) >=
            stageOrder.indexOf(stage.id as StageId);

          return (
            <button
              className={isVisited ? "visited" : ""}
              disabled={!isVisited}
              key={stage.id}
              onClick={() => moveActiveTo(stage.id as StageId)}
              type="button"
            >
              <span>{stage.label}</span>
              <small>{stage.minutes} min</small>
            </button>
          );
        })}
      </aside>
      <div className="student-stage">
        {activeSubmission.stage === "brief" && (
          <BriefStage onNext={() => moveActiveTo("baseline")} />
        )}
        {activeSubmission.stage === "baseline" && (
          <BaselineStage
            baseline={activeSubmission.baseline}
            onChange={(baseline) => updateActive({ baseline })}
            onNext={() => moveActiveTo("audit")}
          />
        )}
        {activeSubmission.stage === "audit" && (
          <AuditStage
            auditMarks={activeSubmission.auditMarks}
            onChange={(auditMarks) => updateActive({ auditMarks })}
            onNext={() => moveActiveTo("prompt")}
          />
        )}
        {activeSubmission.stage === "prompt" && (
          <PromptStage
            onChange={(prompt) => updateActive({ prompt })}
            onGenerate={() =>
              updateActive({ revisedMemo, stage: "revision" })
            }
            prompt={activeSubmission.prompt}
          />
        )}
        {activeSubmission.stage === "revision" && (
          <RevisionStage onNext={() => moveActiveTo("final")} />
        )}
        {activeSubmission.stage === "final" && (
          <FinalStage
            acceptedRationale={activeSubmission.acceptedRationale}
            finalMemo={activeSubmission.finalMemo}
            onChange={updateActive}
            onSubmit={() => moveActiveTo("submitted")}
            reflection={activeSubmission.reflection}
            rejectedRationale={activeSubmission.rejectedRationale}
            revisedRationale={activeSubmission.revisedRationale}
          />
        )}
        {activeSubmission.stage === "submitted" && (
          <SubmittedStage onBack={() => moveActiveTo("final")} />
        )}
      </div>
    </section>
  );
}

function BriefStage({ onNext }: { onNext: () => void }) {
  return (
    <section className="panel stage-panel">
      <StageHeader
        icon={<FileText size={20} />}
        label="Brief"
        title={businessBrief.title}
      />
      <div className="brief-grid">
        <InfoBlock title="Context" text={businessBrief.context} />
        <InfoBlock title="Target Customer" text={businessBrief.targetCustomer} />
        <InfoBlock title="Budget" text={businessBrief.budget} />
        <InfoBlock title="Distribution" text={businessBrief.distribution} />
        <InfoBlock title="Brand Constraint" text={businessBrief.brand} />
        <InfoBlock title="Decision Task" text={businessBrief.task} />
      </div>
      <div className="section-band">
        <h3>Product Options</h3>
        <ul className="compact-list">
          {businessBrief.productOptions.map((option) => (
            <li key={option}>{option}</li>
          ))}
        </ul>
      </div>
      <div className="section-band">
        <h3>Research Findings</h3>
        <ul className="compact-list">
          {businessBrief.researchFindings.map((finding) => (
            <li key={finding}>{finding}</li>
          ))}
        </ul>
      </div>
      <div className="action-row">
        <button className="primary" onClick={onNext} type="button">
          <Play size={16} />
          Start Baseline
        </button>
      </div>
    </section>
  );
}

function BaselineStage({
  baseline,
  onChange,
  onNext,
}: {
  baseline: string;
  onChange: (baseline: string) => void;
  onNext: () => void;
}) {
  return (
    <section className="panel stage-panel">
      <StageHeader
        icon={<PencilLine size={20} />}
        label="Human-Only Baseline"
        title="Write your recommendation before seeing the AI memo"
      />
      <label htmlFor="baseline">Baseline recommendation</label>
      <textarea
        id="baseline"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Recommend one flavor and three first-month actions using only the business brief."
        value={baseline}
      />
      <div className="action-row">
        <button
          className="primary"
          disabled={!baseline.trim()}
          onClick={onNext}
          type="button"
        >
          <Check size={16} />
          Lock Baseline
        </button>
      </div>
    </section>
  );
}

function AuditStage({
  auditMarks,
  onChange,
  onNext,
}: {
  auditMarks: Record<string, AuditMark>;
  onChange: (auditMarks: Record<string, AuditMark>) => void;
  onNext: () => void;
}) {
  function updateMark(statementId: string, patch: Partial<AuditMark>) {
    const existing = auditMarks[statementId] ?? {
      statementId,
      decision: "revise",
      category: "unsupported claim",
      note: "",
    };

    onChange({
      ...auditMarks,
      [statementId]: { ...existing, ...patch },
    });
  }

  function clearMark(statementId: string) {
    const next = { ...auditMarks };
    delete next[statementId];
    onChange(next);
  }

  return (
    <section className="stage-stack">
      <div className="panel stage-panel">
        <StageHeader
          icon={<ClipboardCheck size={20} />}
          label="AI-Only Audit"
          title="Tag the flawed AI memo"
        />
        <p className="stage-copy">
          Mark statements that should be questioned, revised, or rejected.
        </p>
      </div>
      <div className="memo-list">
        {flawedMemoStatements.map((statement) => {
          const mark = auditMarks[statement.id];
          return (
            <article className="memo-row" key={statement.id}>
              <p>{statement.text}</p>
              {mark ? (
                <div
                  className={
                    mark.decision === "accept"
                      ? "audit-controls accept-only"
                      : "audit-controls"
                  }
                >
                  <select
                    aria-label="Decision"
                    onChange={(event) =>
                      updateMark(statement.id, {
                        decision: event.target.value as AuditMark["decision"],
                      })
                    }
                    value={mark.decision}
                  >
                    <option value="question">Question</option>
                    <option value="revise">Revise</option>
                    <option value="reject">Reject</option>
                    <option value="accept">Accept</option>
                  </select>
                  {mark.decision !== "accept" && (
                    <>
                      <select
                        aria-label="Issue category"
                        onChange={(event) =>
                          updateMark(statement.id, {
                            category: event.target.value as IssueCategory,
                          })
                        }
                        value={mark.category}
                      >
                        {issueCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <input
                        aria-label="Audit note"
                        onChange={(event) =>
                          updateMark(statement.id, { note: event.target.value })
                        }
                        placeholder="Why?"
                        value={mark.note}
                      />
                    </>
                  )}
                  <button
                    className="ghost"
                    onClick={() => clearMark(statement.id)}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <button
                  className="secondary"
                  onClick={() => updateMark(statement.id, {})}
                  type="button"
                >
                  <ListChecks size={16} />
                  Mark Issue
                </button>
              )}
            </article>
          );
        })}
      </div>
      <div className="panel action-panel">
        <span>{Object.keys(auditMarks).length} statements marked</span>
        <button
          className="primary"
          disabled={Object.keys(auditMarks).length < 3}
          onClick={onNext}
          type="button"
        >
          <Check size={16} />
          Continue
        </button>
      </div>
    </section>
  );
}

function PromptStage({
  onChange,
  onGenerate,
  prompt,
}: {
  onChange: (prompt: string) => void;
  onGenerate: () => void;
  prompt: string;
}) {
  return (
    <section className="panel stage-panel">
      <StageHeader
        icon={<Sparkles size={20} />}
        label="Coached AI Revision"
        title="Write a targeted revision prompt"
      />
      <label htmlFor="prompt">Revision prompt</label>
      <textarea
        id="prompt"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Name the flaws, constraints, evidence boundaries, output format, and tone."
        value={prompt}
      />
      <div className="action-row split">
        <button className="secondary" onClick={() => onChange(samplePrompt)} type="button">
          <FileText size={16} />
          Load Sample
        </button>
        <button
          className="primary"
          disabled={!prompt.trim()}
          onClick={onGenerate}
          type="button"
        >
          <Sparkles size={16} />
          Generate Revised Memo
        </button>
      </div>
    </section>
  );
}

function RevisionStage({ onNext }: { onNext: () => void }) {
  return (
    <section className="stage-stack">
      <div className="panel stage-panel">
        <StageHeader
          icon={<RefreshCw size={20} />}
          label="AI Revision"
          title="Compare original and revised memo"
        />
      </div>
      <div className="comparison-grid">
        <MemoPanel title="Original flawed memo" tone="warning">
          {flawedMemoStatements.map((statement) => (
            <p key={statement.id}>{statement.text}</p>
          ))}
        </MemoPanel>
        <MemoPanel title="Mock revised memo" tone="success">
          {revisedMemo.split("\n\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </MemoPanel>
      </div>
      <div className="panel action-panel">
        <span>Mock AI output is deterministic for classroom consistency.</span>
        <button className="primary" onClick={onNext} type="button">
          <PencilLine size={16} />
          Final Edit
        </button>
      </div>
    </section>
  );
}

function FinalStage({
  acceptedRationale,
  finalMemo,
  onChange,
  onSubmit,
  reflection,
  rejectedRationale,
  revisedRationale,
}: {
  acceptedRationale: string;
  finalMemo: string;
  onChange: (patch: Partial<Submission>) => void;
  onSubmit: () => void;
  reflection: string;
  rejectedRationale: string;
  revisedRationale: string;
}) {
  return (
    <section className="panel stage-panel">
      <StageHeader
        icon={<Save size={20} />}
        label="Human-AI Final Editing"
        title="Submit the final memo and rationale"
      />
      <label htmlFor="finalMemo">Final recommendation memo</label>
      <textarea
        id="finalMemo"
        onChange={(event) => onChange({ finalMemo: event.target.value })}
        placeholder="Write the final memo controlled by human judgment."
        value={finalMemo}
      />
      <div className="action-row">
        <button
          className="secondary"
          onClick={() => onChange({ finalMemo: sampleFinalMemo })}
          type="button"
        >
          <FileText size={16} />
          Load Sample Memo
        </button>
      </div>
      <div className="rationale-grid">
        <TextField
          label="Accepted AI content"
          onChange={(accepted) => onChange({ acceptedRationale: accepted })}
          value={acceptedRationale}
        />
        <TextField
          label="Revised AI content"
          onChange={(revised) => onChange({ revisedRationale: revised })}
          value={revisedRationale}
        />
        <TextField
          label="Rejected AI content"
          onChange={(rejected) => onChange({ rejectedRationale: rejected })}
          value={rejectedRationale}
        />
      </div>
      <label htmlFor="reflection">Debrief reflection</label>
      <textarea
        className="short"
        id="reflection"
        onChange={(event) => onChange({ reflection: event.target.value })}
        placeholder="Which AI errors were easiest to miss, and where did human intervention add the most value?"
        value={reflection}
      />
      <div className="action-row">
        <button
          className="primary"
          disabled={
            !finalMemo.trim() ||
            !acceptedRationale.trim() ||
            !revisedRationale.trim() ||
            !rejectedRationale.trim()
          }
          onClick={onSubmit}
          type="button"
        >
          <Check size={16} />
          Submit
        </button>
      </div>
    </section>
  );
}

function SubmittedStage({ onBack }: { onBack: () => void }) {
  return (
    <section className="panel submitted-panel">
      <Check size={32} />
      <h2>Submission complete</h2>
      <p>The instructor dashboard now includes this baseline, audit, prompt, final memo, and rationale.</p>
      <button className="secondary" onClick={onBack} type="button">
        <PencilLine size={16} />
        Edit Final Memo
      </button>
    </section>
  );
}

function InstructorWorkspace({
  resetLocalData,
  reloadSubmissions,
  selectedSubmission,
  selectedSubmissionId,
  setSelectedSubmissionId,
  submissions,
  updateSubmission,
}: {
  resetLocalData: () => void;
  reloadSubmissions: () => void;
  selectedSubmission: Submission | null;
  selectedSubmissionId: string | null;
  setSelectedSubmissionId: (id: string) => void;
  submissions: Submission[];
  updateSubmission: (id: string, patch: Partial<Submission>) => void;
}) {
  const averageDetection =
    submissions.length === 0
      ? 0
      : Math.round(
          submissions.reduce(
            (sum, submission) => sum + summarizeSubmission(submission).detectionRate,
            0,
          ) / submissions.length,
        );

  function exportData() {
    downloadFile(
      "audit-the-bot-submissions.json",
      JSON.stringify(submissions, null, 2),
      "application/json",
    );
  }

  function exportAnalyticsCsv() {
    downloadFile(
      "audit_the_bot_analytics.csv",
      toAnalyticsCsv(submissions),
      "text/csv",
    );
  }

  function exportWorkflowSchema() {
    downloadFile(
      "audit_the_bot_dataset_schema.json",
      JSON.stringify(createBtbWorkflowSchema(), null, 2),
      "application/json",
    );
  }

  function exportWorkflowTemplate() {
    downloadFile(
      "audit_the_bot_analysis_template.json",
      JSON.stringify(createBtbWorkflowTemplate(), null, 2),
      "application/json",
    );
  }

  return (
    <section className="instructor-layout">
      <div className="metrics-row">
        <Metric label="Participants" value={submissions.length.toString()} />
        <Metric
          label="Submitted"
          value={submissions
            .filter((submission) => submission.stage === "submitted")
            .length.toString()}
        />
        <Metric label="Known Issues" value={knownIssues.length.toString()} />
        <Metric label="Avg Detection" value={`${averageDetection}%`} />
      </div>

      <div className="toolbar">
        <button className="secondary" onClick={reloadSubmissions} type="button">
          <RefreshCw size={16} />
          Refresh Data
        </button>
        <button className="secondary" onClick={exportData} type="button">
          <Download size={16} />
          Export JSON
        </button>
        <button className="secondary" onClick={exportAnalyticsCsv} type="button">
          <Download size={16} />
          BTBworkflow CSV
        </button>
        <button className="secondary" onClick={exportWorkflowSchema} type="button">
          <Download size={16} />
          Schema
        </button>
        <button className="secondary" onClick={exportWorkflowTemplate} type="button">
          <Download size={16} />
          Template
        </button>
        <button className="ghost danger" onClick={resetLocalData} type="button">
          Clear Local Data
        </button>
      </div>

      <div className="dashboard-grid">
        <section className="panel table-panel">
          <h2>Session Progress</h2>
          {submissions.length === 0 ? (
            <p className="muted">No submissions yet.</p>
          ) : (
            <div className="submission-list">
              {submissions.map((submission) => {
                const summary = summarizeSubmission(submission);
                return (
                  <button
                    className={
                      selectedSubmissionId === submission.id ? "selected" : ""
                    }
                    key={submission.id}
                    onClick={() => setSelectedSubmissionId(submission.id)}
                    type="button"
                  >
                    <span>{submission.participantName}</span>
                    <small>
                      {submission.stage} · {summary.detectedKnownIssues}/
                      {knownIssues.length} issues · {summary.total}/10
                    </small>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {selectedSubmission && (
          <SubmissionDetail
            submission={selectedSubmission}
            updateSubmission={updateSubmission}
          />
        )}
      </div>
    </section>
  );
}

function SubmissionDetail({
  submission,
  updateSubmission,
}: {
  submission: Submission;
  updateSubmission: (id: string, patch: Partial<Submission>) => void;
}) {
  const summary = summarizeSubmission(submission);

  function updateScore(key: keyof RubricScore, value: number) {
    updateSubmission(submission.id, {
      score: {
        ...defaultScore,
        ...submission.score,
        [key]: value,
      },
    });
  }

  return (
    <section className="panel detail-panel">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Submission</p>
          <h2>{submission.participantName}</h2>
        </div>
        <span className="score-pill">{summary.total}/10</span>
      </div>

      <div className="summary-strip">
        <span>{summary.issueCount} marks</span>
        <span>{summary.detectedKnownIssues} known issues found</span>
        <span>{summary.detectionRate}% detection</span>
      </div>

      <div className="detail-section">
        <h3>Baseline</h3>
        <p>{submission.baseline || "No baseline submitted."}</p>
      </div>

      <div className="detail-section">
        <h3>Audit Marks</h3>
        {Object.values(submission.auditMarks).length === 0 ? (
          <p className="muted">No audit marks submitted.</p>
        ) : (
          <ul className="audit-summary">
            {Object.values(submission.auditMarks).map((mark) => (
              <li key={mark.statementId}>
                <strong>{mark.statementId}</strong> · {mark.decision} ·{" "}
                {mark.category}
                <span>{mark.note || "No note"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="detail-section">
        <h3>Prompt</h3>
        <p>{submission.prompt || "No prompt submitted."}</p>
      </div>

      <div className="detail-section">
        <h3>Final Memo</h3>
        <p>{submission.finalMemo || "No final memo submitted."}</p>
      </div>

      <div className="score-grid">
        {rubricAnchors.map((rubric) => (
          <label key={rubric.key}>
            {rubric.label}
            <select
              onChange={(event) =>
                updateScore(rubric.key as keyof RubricScore, Number(event.target.value))
              }
              value={
                submission.score?.[rubric.key as keyof RubricScore] ??
                defaultScore[rubric.key as keyof RubricScore]
              }
            >
              {Array.from({ length: rubric.max + 1 }, (_, value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <small>{rubric.anchors.join(" ")}</small>
          </label>
        ))}
      </div>
    </section>
  );
}

function StageHeader({
  icon,
  label,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
}) {
  return (
    <div className="stage-header">
      <span>{icon}</span>
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function InfoBlock({ text, title }: { text: string; title: string }) {
  return (
    <section className="info-block">
      <h3>{title}</h3>
      <p>{text}</p>
    </section>
  );
}

function TextField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <label htmlFor={id}>
      {label}
      <textarea
        className="short"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function MemoPanel({
  children,
  title,
  tone,
}: {
  children: React.ReactNode;
  title: string;
  tone: "warning" | "success";
}) {
  return (
    <section className={`memo-panel ${tone}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <section className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function downloadFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
