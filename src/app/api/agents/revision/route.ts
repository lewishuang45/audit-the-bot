import { runGeminiRevisionAgent, runMockRevisionAgent } from "@/lib/agent-api";
import type { AgentRunRequest, RevisionAgentInput } from "@/lib/agent-api";

const liveCallsByClient = new Map<
  string,
  { day: string; dailyCount: number; minute: number; minuteCount: number }
>();

function getClientId(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function checkLiveRateLimit(clientId: string) {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const minute = Math.floor(now.getTime() / 60000);
  const dailyLimit = Number(process.env.ATB_LIVE_DAILY_LIMIT ?? "50");
  const minuteLimit = Number(process.env.ATB_LIVE_MINUTE_LIMIT ?? "5");
  const current = liveCallsByClient.get(clientId);

  if (!current || current.day !== day) {
    liveCallsByClient.set(clientId, {
      day,
      dailyCount: 1,
      minute,
      minuteCount: 1,
    });
    return null;
  }

  if (current.minute === minute && current.minuteCount >= minuteLimit) {
    return {
      code: "RATE_LIMITED",
      message: "Too many live AI requests in one minute. Try again shortly.",
    };
  }

  if (current.dailyCount >= dailyLimit) {
    return {
      code: "DAILY_LIMIT_REACHED",
      message: "Daily live AI request limit reached for this client.",
    };
  }

  liveCallsByClient.set(clientId, {
    day,
    dailyCount: current.dailyCount + 1,
    minute,
    minuteCount: current.minute === minute ? current.minuteCount + 1 : 1,
  });
  return null;
}

export async function POST(request: Request) {
  let body: Partial<AgentRunRequest<RevisionAgentInput>> | null;

  try {
    body = (await request.json()) as Partial<AgentRunRequest<RevisionAgentInput>>;
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

  if (!body || body.agent !== "revision") {
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

  const apiKey = process.env.GEMINI_API_KEY;
  const liveEnabled = process.env.ATB_LIVE_AI === "true";
  if (liveEnabled && apiKey) {
    const rateLimitError = checkLiveRateLimit(getClientId(request));
    if (rateLimitError) {
      return Response.json({ error: rateLimitError }, { status: 429 });
    }

    try {
      return Response.json(
        await runGeminiRevisionAgent(body as AgentRunRequest<RevisionAgentInput>, {
          apiKey,
          model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",
          timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS ?? "20000"),
        }),
      );
    } catch (error) {
      return Response.json(
        {
          error: {
            code: "LIVE_PROVIDER_ERROR",
            message:
              error instanceof Error
                ? error.message
                : "Live Gemini revision failed.",
          },
        },
        { status: 502 },
      );
    }
  }

  return Response.json(runMockRevisionAgent(body as AgentRunRequest<RevisionAgentInput>));
}
