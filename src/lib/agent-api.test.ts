import { describe, expect, it } from "vitest";
import {
  buildProviderPayload,
  createRevisionAgentMessages,
  runMockMaterialAgent,
} from "./agent-api";

const messages = createRevisionAgentMessages({
  businessBrief: "Brief",
  flawedMemo: "Memo",
  auditMarks: [],
  studentPrompt: "Fix unsupported claims.",
});

describe("agent API provider payloads", () => {
  it("builds an OpenAI Responses payload", () => {
    const payload = buildProviderPayload(
      { protocol: "openai-responses", model: "gpt-5.2" },
      messages,
      "revision_schema",
    );

    expect(payload).toMatchObject({
      model: "gpt-5.2",
      text: { format: { type: "json_schema", name: "revision_schema" } },
    });
  });

  it("builds an Anthropic Messages payload with system separated", () => {
    const payload = buildProviderPayload(
      { protocol: "anthropic-messages", model: "claude-sonnet" },
      messages,
      "revision_schema",
    );

    expect(payload).toMatchObject({
      model: "claude-sonnet",
      system: expect.stringContaining("revision agent"),
      messages: [{ role: "user", content: expect.any(String) }],
    });
  });

  it("builds a Gemini generateContent payload with model role mapping", () => {
    const payload = buildProviderPayload(
      { protocol: "gemini-generate-content", model: "gemini-pro" },
      [...messages, { role: "assistant", content: "Draft" }],
      "revision_schema",
    );

    expect(payload).toMatchObject({
      model: "gemini-pro",
      generationConfig: { responseMimeType: "application/json" },
      contents: [
        { role: "user", parts: [{ text: expect.any(String) }] },
        { role: "model", parts: [{ text: "Draft" }] },
      ],
    });
  });

  it("returns a material pack from the mock material agent", () => {
    const result = runMockMaterialAgent({
      agent: "material-generator",
      input: {
        courseTopic: "Critical evaluation of AI output",
        targetSkill: "Audit flawed AI business recommendations",
        previousSessions: [],
      },
    });

    expect(result.output.title).toContain("Audit the Bot");
    expect(result.status).toBe("mocked");
  });
});
