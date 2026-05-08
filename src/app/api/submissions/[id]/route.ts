import {
  deleteSubmission,
  updateSubmission,
} from "@/lib/sqlite-submission-store";
import type { Submission } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const patch = (await request.json()) as Partial<Submission>;

  return Response.json(updateSubmission(id, patch));
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  deleteSubmission(id);

  return Response.json({ ok: true });
}
