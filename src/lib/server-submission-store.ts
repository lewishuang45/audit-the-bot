import fs from "node:fs";
import path from "node:path";
import type { Submission } from "./types";

type StorePayload = {
  submissions: Submission[];
};

const defaultStorePath = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "data",
  "audit-the-bot-submissions.json",
);
const vercelDemoStorePath = path.join(
  /* turbopackIgnore: true */ "/tmp",
  "audit-the-bot-submissions.json",
);

let writeQueue = Promise.resolve();

export function listSubmissions(): Submission[] {
  return readStore().submissions.sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function createSubmission(submission: Submission): Promise<Submission> {
  const payload = readStore();
  payload.submissions = [
    submission,
    ...payload.submissions.filter((item) => item.id !== submission.id),
  ];
  await queueWrite(payload);
  return submission;
}

export async function updateSubmission(
  id: string,
  patch: Partial<Submission>,
): Promise<Submission> {
  await writeQueue;
  const payload = readStore();
  const index = payload.submissions.findIndex((submission) => submission.id === id);
  if (index === -1) {
    throw new Error(`Submission not found: ${id}`);
  }

  const next = {
    ...payload.submissions[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  payload.submissions[index] = next;
  await queueWrite(payload);
  return next;
}

export async function deleteSubmission(id: string) {
  await writeQueue;
  const payload = readStore();
  payload.submissions = payload.submissions.filter(
    (submission) => submission.id !== id,
  );
  await queueWrite(payload);
}

export async function clearSubmissions() {
  await queueWrite({ submissions: [] });
}

function readStore(): StorePayload {
  const storePath = getStorePath();
  if (!fs.existsSync(storePath)) {
    return { submissions: [] };
  }

  try {
    const payload = JSON.parse(fs.readFileSync(storePath, "utf8")) as StorePayload;
    return Array.isArray(payload.submissions) ? payload : { submissions: [] };
  } catch {
    return { submissions: [] };
  }
}

function queueWrite(payload: StorePayload): Promise<void> {
  writeQueue = writeQueue.then(() => writeStore(payload));
  return writeQueue;
}

async function writeStore(payload: StorePayload) {
  const storePath = getStorePath();
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  const tempPath = `${storePath}.tmp`;
  await fs.promises.writeFile(
    tempPath,
    JSON.stringify(payload, null, 2),
    "utf8",
  );
  await fs.promises.rename(tempPath, storePath);
}

function getStorePath() {
  if (process.env.SUBMISSION_STORE_PATH) {
    return process.env.SUBMISSION_STORE_PATH;
  }

  return process.env.VERCEL ? vercelDemoStorePath : defaultStorePath;
}
