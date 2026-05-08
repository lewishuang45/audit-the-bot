import fs from "node:fs";
import path from "node:path";
import type { AuditMark, RubricScore, StageId, Submission } from "./types";

type SqliteModule = typeof import("node:sqlite");

type SqliteDatabase = InstanceType<SqliteModule["DatabaseSync"]>;

type SubmissionRow = {
  id: string;
  participantName: string;
  stage: string;
  baseline: string;
  auditMarksJson: string;
  prompt: string;
  revisedMemo: string;
  finalMemo: string;
  acceptedRationale: string;
  revisedRationale: string;
  rejectedRationale: string;
  reflection: string;
  scoreJson: string | null;
  createdAt: string;
  updatedAt: string;
};

let db: SqliteDatabase | null = null;

export function listSubmissions(): Submission[] {
  const rows = getDb()
    .prepare("SELECT * FROM submissions ORDER BY createdAt DESC")
    .all() as SubmissionRow[];

  return rows.map(fromRow);
}

export function createSubmission(submission: Submission): Submission {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO submissions (
        id, participantName, stage, baseline, auditMarksJson, prompt,
        revisedMemo, finalMemo, acceptedRationale, revisedRationale,
        rejectedRationale, reflection, scoreJson, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      submission.id,
      submission.participantName,
      submission.stage,
      submission.baseline ?? "",
      JSON.stringify(submission.auditMarks ?? {}),
      submission.prompt ?? "",
      submission.revisedMemo ?? "",
      submission.finalMemo ?? "",
      submission.acceptedRationale ?? "",
      submission.revisedRationale ?? "",
      submission.rejectedRationale ?? "",
      submission.reflection ?? "",
      submission.score ? JSON.stringify(submission.score) : null,
      submission.createdAt || now,
      now,
    );

  return getSubmission(submission.id);
}

export function updateSubmission(
  id: string,
  patch: Partial<Submission>,
): Submission {
  const current = getSubmission(id);
  const next: Submission = {
    ...current,
    ...patch,
    auditMarks: patch.auditMarks ?? current.auditMarks,
    score: patch.score ?? current.score,
    updatedAt: new Date().toISOString(),
  };

  getDb()
    .prepare(
      `UPDATE submissions SET
        participantName = ?,
        stage = ?,
        baseline = ?,
        auditMarksJson = ?,
        prompt = ?,
        revisedMemo = ?,
        finalMemo = ?,
        acceptedRationale = ?,
        revisedRationale = ?,
        rejectedRationale = ?,
        reflection = ?,
        scoreJson = ?,
        updatedAt = ?
      WHERE id = ?`,
    )
    .run(
      next.participantName,
      next.stage,
      next.baseline,
      JSON.stringify(next.auditMarks),
      next.prompt,
      next.revisedMemo,
      next.finalMemo,
      next.acceptedRationale,
      next.revisedRationale,
      next.rejectedRationale,
      next.reflection,
      next.score ? JSON.stringify(next.score) : null,
      next.updatedAt,
      id,
    );

  return getSubmission(id);
}

export function deleteSubmission(id: string) {
  getDb().prepare("DELETE FROM submissions WHERE id = ?").run(id);
}

export function clearSubmissions() {
  getDb().prepare("DELETE FROM submissions").run();
}

function getSubmission(id: string): Submission {
  const row = getDb()
    .prepare("SELECT * FROM submissions WHERE id = ?")
    .get(id) as SubmissionRow | undefined;

  if (!row) {
    throw new Error(`Submission not found: ${id}`);
  }

  return fromRow(row);
}

function getDb(): SqliteDatabase {
  if (db) {
    return db;
  }

  const sqlite = require("node:sqlite") as SqliteModule;
  const dbPath =
    process.env.SQLITE_PATH ??
    path.join(process.cwd(), "data", "audit-the-bot.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new sqlite.DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      participantName TEXT NOT NULL,
      stage TEXT NOT NULL,
      baseline TEXT NOT NULL DEFAULT '',
      auditMarksJson TEXT NOT NULL DEFAULT '{}',
      prompt TEXT NOT NULL DEFAULT '',
      revisedMemo TEXT NOT NULL DEFAULT '',
      finalMemo TEXT NOT NULL DEFAULT '',
      acceptedRationale TEXT NOT NULL DEFAULT '',
      revisedRationale TEXT NOT NULL DEFAULT '',
      rejectedRationale TEXT NOT NULL DEFAULT '',
      reflection TEXT NOT NULL DEFAULT '',
      scoreJson TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  return db;
}

function fromRow(row: SubmissionRow): Submission {
  return {
    id: row.id,
    participantName: row.participantName,
    stage: row.stage as StageId,
    baseline: row.baseline,
    auditMarks: parseJson<Record<string, AuditMark>>(row.auditMarksJson, {}),
    prompt: row.prompt,
    revisedMemo: row.revisedMemo,
    finalMemo: row.finalMemo,
    acceptedRationale: row.acceptedRationale,
    revisedRationale: row.revisedRationale,
    rejectedRationale: row.rejectedRationale,
    reflection: row.reflection,
    score: row.scoreJson
      ? parseJson<RubricScore | undefined>(row.scoreJson, undefined)
      : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
