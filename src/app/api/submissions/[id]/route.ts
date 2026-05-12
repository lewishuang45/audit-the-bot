import {
  deleteSubmission,
  updateSubmission,
} from "@/lib/server-submission-store";
import type { Submission } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let patch: Partial<Submission> | null;

  try {
    patch = (await request.json()) as Partial<Submission>;
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

  if (!patch) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request body must be a JSON object.",
        },
      },
      { status: 422 },
    );
  }

  try {
    return Response.json(await updateSubmission(id, patch));
  } catch (error) {
    return Response.json(
      {
        error: {
          code: "SUBMISSION_NOT_FOUND",
          message:
            error instanceof Error ? error.message : "Submission not found.",
        },
      },
      { status: 404 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  await deleteSubmission(id);

  return Response.json({ ok: true });
}
