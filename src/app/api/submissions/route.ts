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
  const body = (await request.json()) as Submission;

  if (!body.id || !body.participantName) {
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

  return Response.json(await createSubmission(body), { status: 201 });
}

export async function DELETE() {
  await clearSubmissions();
  return Response.json({ ok: true });
}
