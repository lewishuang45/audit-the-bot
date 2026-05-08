import { runMockRevisionAgent } from "@/lib/agent-api";
import type { AgentRunRequest, RevisionAgentInput } from "@/lib/agent-api";

export async function POST(request: Request) {
  const body = (await request.json()) as AgentRunRequest<RevisionAgentInput>;

  if (body.agent !== "revision") {
    return Response.json(
      {
        error: {
          code: "INVALID_AGENT",
          message: "Expected agent to be revision.",
        },
      },
      { status: 422 },
    );
  }

  if (!body.input?.businessBrief || !body.input?.flawedMemo) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "businessBrief and flawedMemo are required.",
        },
      },
      { status: 422 },
    );
  }

  return Response.json(runMockRevisionAgent(body));
}
