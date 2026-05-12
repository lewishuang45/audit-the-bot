import {
  clearSubmissions,
  createSubmission,
  listSubmissions,
} from "@/lib/server-submission-store";
import type { Submission } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(listSubmissions());
}

export async function POST(request: Request) {
  let body: Partial<Submission> | null;

  try {
    body = (await request.json()) as Partial<Submission>;
  } catch {
    return Response.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 },
    );
  }

  if (!body?.id || !body.participantName) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "id and participantName are required.",
        },
      },
      { status: 422 },
    );
  }

  return Response.json(await createSubmission(body as Submission), { status: 201 });
}

export async function DELETE() {
  await clearSubmissions();
  return Response.json({ ok: true });
}
