import { runMockMaterialAgent } from "@/lib/agent-api";
import type { AgentRunRequest, MaterialAgentInput } from "@/lib/agent-api";

export async function POST(request: Request) {
  let body: Partial<AgentRunRequest<MaterialAgentInput>> | null;

  try {
    body = (await request.json()) as Partial<AgentRunRequest<MaterialAgentInput>>;
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

  if (!body || body.agent !== "material-generator") {
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

  return Response.json(runMockMaterialAgent(body as AgentRunRequest<MaterialAgentInput>));
}
