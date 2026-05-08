import { runMockMaterialAgent } from "@/lib/agent-api";
import type { AgentRunRequest, MaterialAgentInput } from "@/lib/agent-api";

export async function POST(request: Request) {
  const body = (await request.json()) as AgentRunRequest<MaterialAgentInput>;

  if (body.agent !== "material-generator") {
    return Response.json(
      {
        error: {
          code: "INVALID_AGENT",
          message: "Expected agent to be material-generator.",
        },
      },
      { status: 422 },
    );
  }

  if (!body.input?.courseTopic || !body.input?.targetSkill) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "courseTopic and targetSkill are required.",
        },
      },
      { status: 422 },
    );
  }

  return Response.json(runMockMaterialAgent(body));
}
