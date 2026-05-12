import {
  businessBrief,
  flawedMemoStatements,
  revisedMemo,
  sampleFinalMemo,
  samplePrompt,
} from "./simulation-content";
import type { AuditMark } from "./types";

export type AgentType = "material-generator" | "revision";

export type ProviderProtocol =
  | "openai-responses"
  | "openai-chat-completions"
  | "anthropic-messages"
  | "gemini-generate-content"
  | "custom-http";

export type AgentRole = "system" | "user" | "assistant";

export type AgentMessage = {
  role: AgentRole;
  content: string;
};

export type ProviderConfig = {
  protocol: ProviderProtocol;
  model: string;
  baseUrl?: string;
  apiKeyEnv?: string;
  temperature?: number;
  maxOutputTokens?: number;
};

export type SessionPerformanceSummary = {
  sessionId: string;
  date: string;
  averageDetectionRate: number;
  commonMissedCategories: string[];
  weakPromptPatterns: string[];
  instructorNotes?: string;
};

export type MaterialAgentInput = {
  courseTopic: string;
  targetSkill: string;
  previousSessions?: SessionPerformanceSummary[];
  constraints?: {
    sessionMinutes?: number;
    language?: "en" | "zh" | "bilingual";
    difficulty?: "intro" | "intermediate" | "advanced";
  };
};

export type RevisionAgentInput = {
  businessBrief: string;
  flawedMemo: string;
  auditMarks?: AuditMark[];
  studentPrompt?: string;
};

export type AgentRunRequest<TInput> = {
  agent: AgentType;
  input: TInput;
  provider?: ProviderConfig;
  includeProviderPayloadPreview?: boolean;
};

export type AgentRunResult<TOutput> = {
  id: string;
  agent: AgentType;
  status: "mocked" | "ready-for-live-provider" | "live";
  output: TOutput;
  providerPayloadPreview?: unknown;
  warnings: string[];
};

export type MaterialPackOutput = {
  title: string;
  businessBrief: typeof businessBrief;
  flawedMemo: string;
  samplePrompt: string;
  sampleRevisedMemo: string;
  sampleFinalMemo: string;
  generationRationale: string;
};

export type RevisionOutput = {
  revisedMemo: string;
  coachingNotes: string[];
};

export function createMaterialAgentMessages(
  input: MaterialAgentInput,
): AgentMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a curriculum material generation agent for a human-AI collaboration course. Return structured classroom simulation material grounded in prior performance data.",
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          task: "Generate a one-session Audit the Bot classroom content pack.",
          courseTopic: input.courseTopic,
          targetSkill: input.targetSkill,
          previousSessions: input.previousSessions ?? [],
          constraints: input.constraints,
          requiredSections: [
            "businessBrief",
            "flawedAiMemo",
            "hiddenAnswerKey",
            "issueCategories",
            "samplePrompt",
            "sampleRevisedMemo",
            "sampleFinalMemo",
            "rubricAnchors",
          ],
        },
        null,
        2,
      ),
    },
  ];
}

export function createRevisionAgentMessages(
  input: RevisionAgentInput,
): AgentMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a revision agent. Rewrite flawed AI business recommendations using only the provided brief, student audit findings, and student prompt. Do not invent facts.",
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          businessBrief: input.businessBrief,
          flawedMemo: input.flawedMemo,
          auditMarks: input.auditMarks ?? [],
          studentPrompt: input.studentPrompt ?? "",
          outputRules: [
            "Return a revised memo only.",
            "Respect all case constraints.",
            "Remove unsupported claims.",
            "Avoid medical, productivity, or guaranteed performance claims.",
          ],
        },
        null,
        2,
      ),
    },
  ];
}

export function buildProviderPayload(
  provider: ProviderConfig,
  messages: AgentMessage[],
  schemaName: string,
): unknown {
  const temperature = provider.temperature ?? 0.4;
  const maxTokens = provider.maxOutputTokens ?? 1600;
  const systemMessages = messages.filter((message) => message.role === "system");
  const conversationMessages = messages.filter(
    (message) => message.role !== "system",
  );

  switch (provider.protocol) {
    case "openai-responses":
      return {
        model: provider.model,
        input: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        temperature,
        max_output_tokens: maxTokens,
        text: {
          format: {
            type: "json_schema",
            name: schemaName,
            strict: true,
          },
        },
      };
    case "openai-chat-completions":
      return {
        model: provider.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: schemaName,
            strict: true,
          },
        },
      };
    case "anthropic-messages":
      return {
        model: provider.model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessages.map((message) => message.content).join("\n\n"),
        messages: conversationMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      };
    case "gemini-generate-content":
      return {
        model: provider.model,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
        },
        systemInstruction: systemMessages.length
          ? {
              parts: systemMessages.map((message) => ({
                text: message.content,
              })),
            }
          : undefined,
        contents: conversationMessages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
      };
    case "custom-http":
      return {
        model: provider.model,
        messages,
        temperature,
        maxOutputTokens: maxTokens,
        responseSchemaName: schemaName,
      };
  }
}

export function runMockMaterialAgent(
  request: AgentRunRequest<MaterialAgentInput>,
): AgentRunResult<MaterialPackOutput> {
  const providerPayloadPreview =
    request.provider && request.includeProviderPayloadPreview
      ? buildProviderPayload(
          request.provider,
          createMaterialAgentMessages(request.input),
          "audit_the_bot_material_pack",
        )
      : undefined;

  return {
    id: crypto.randomUUID(),
    agent: "material-generator",
    status: request.provider ? "ready-for-live-provider" : "mocked",
    output: {
      title: "Audit the Bot: CampusTea Spark Launch",
      businessBrief,
      flawedMemo: flawedMemoStatements
        .map((statement) => statement.text)
        .join("\n\n"),
      samplePrompt,
      sampleRevisedMemo: revisedMemo,
      sampleFinalMemo,
      generationRationale:
        "This mock material pack preserves the current lesson objective while leaving a provider-neutral path for future agent-generated cases based on historical classroom performance.",
    },
    providerPayloadPreview,
    warnings: request.provider
      ? [
          "Live provider execution is not enabled yet. This response includes a provider payload preview only.",
        ]
      : [],
  };
}

export function runMockRevisionAgent(
  request: AgentRunRequest<RevisionAgentInput>,
): AgentRunResult<RevisionOutput> {
  const providerPayloadPreview =
    request.provider && request.includeProviderPayloadPreview
      ? buildProviderPayload(
          request.provider,
          createRevisionAgentMessages(request.input),
          "audit_the_bot_revised_memo",
        )
      : undefined;

  return {
    id: crypto.randomUUID(),
    agent: "revision",
    status: request.provider ? "ready-for-live-provider" : "mocked",
    output: {
      revisedMemo,
      coachingNotes: [
        "The revised memo is constrained to the business brief.",
        "Unsupported distribution, pricing, and performance claims were removed.",
        "Mock mode keeps classroom outputs stable while the live provider interface matures.",
      ],
    },
    providerPayloadPreview,
    warnings: request.provider
      ? [
          "Live provider execution is not enabled yet. This response includes a provider payload preview only.",
        ]
      : [],
  };
}

export type GeminiRevisionOptions = {
  apiKey: string;
  model: string;
  timeoutMs?: number;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match?.[1]) {
    return JSON.parse(match[1]);
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  throw new Error("Gemini response did not contain JSON.");
}

function parseRevisionOutput(text: string): RevisionOutput {
  const parsed = extractJsonObject(text) as Partial<RevisionOutput>;
  if (!parsed.revisedMemo || typeof parsed.revisedMemo !== "string") {
    throw new Error("Gemini response did not include revisedMemo.");
  }

  return {
    revisedMemo: parsed.revisedMemo,
    coachingNotes: Array.isArray(parsed.coachingNotes)
      ? parsed.coachingNotes.filter((note): note is string => typeof note === "string")
      : [],
  };
}

export async function runGeminiRevisionAgent(
  request: AgentRunRequest<RevisionAgentInput>,
  options: GeminiRevisionOptions,
): Promise<AgentRunResult<RevisionOutput>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 20000);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    options.model,
  )}:generateContent?key=${encodeURIComponent(options.apiKey)}`;
  const messages = createRevisionAgentMessages(request.input);
  const systemText = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  const userText = messages
    .filter((message) => message.role !== "system")
    .map((message) => message.content)
    .join("\n\n");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${systemText}\n\nReturn strict JSON with this shape: {"revisedMemo":"...","coachingNotes":["..."]}.`,
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userText }],
          },
        ],
        generationConfig: {
          temperature: request.provider?.temperature ?? 0.3,
          maxOutputTokens: request.provider?.maxOutputTokens ?? 1400,
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Gemini request failed (${response.status}): ${detail.slice(0, 300)}`);
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      throw new Error("Gemini response was empty.");
    }

    return {
      id: crypto.randomUUID(),
      agent: "revision",
      status: "live",
      output: parseRevisionOutput(text),
      warnings: [],
    };
  } finally {
    clearTimeout(timeout);
  }
}
