# Agent API Design: Audit the Bot

## Goal

The product should evolve from a fixed simulation into an adaptive classroom system.

Two agent surfaces are needed:

1. `material-generator`: generates each lesson's business brief, flawed AI memo, hidden answer key, sample prompt, revised memo, final memo, and rubric anchors based on historical classroom performance.
2. `revision`: revises a flawed AI memo using the business brief, student audit marks, and student prompt.

The application should not bind itself to one model provider. Internally it uses one provider-neutral message contract, then maps that contract to common LLM API protocols.

## Current Endpoints

### POST `/api/agents/materials`

Purpose: generate or preview a classroom material pack.

Request:

```json
{
  "agent": "material-generator",
  "input": {
    "courseTopic": "Critical evaluation of AI output",
    "targetSkill": "Audit flawed AI business recommendations",
    "previousSessions": [
      {
        "sessionId": "BTB-7041-001",
        "date": "2026-05-08",
        "averageDetectionRate": 58,
        "commonMissedCategories": ["unsupported claim", "ethical or tone risk"],
        "weakPromptPatterns": ["generic rewrite requests"],
        "instructorNotes": "Students missed price and distribution constraints."
      }
    ],
    "constraints": {
      "sessionMinutes": 60,
      "language": "en",
      "difficulty": "intro"
    }
  },
  "provider": {
    "protocol": "openai-responses",
    "model": "gpt-5.2",
    "apiKeyEnv": "OPENAI_API_KEY",
    "temperature": 0.4,
    "maxOutputTokens": 1600
  },
  "includeProviderPayloadPreview": true
}
```

Response:

```json
{
  "id": "run-id",
  "agent": "material-generator",
  "status": "ready-for-live-provider",
  "output": {
    "title": "Audit the Bot: CampusTea Spark Launch",
    "businessBrief": {},
    "flawedMemo": "...",
    "samplePrompt": "...",
    "sampleRevisedMemo": "...",
    "sampleFinalMemo": "...",
    "generationRationale": "..."
  },
  "providerPayloadPreview": {},
  "warnings": ["Live provider execution is not enabled yet."]
}
```

### POST `/api/agents/revision`

Purpose: revise the AI memo based on a student's audit and prompt.

Request:

```json
{
  "agent": "revision",
  "input": {
    "businessBrief": "Full brief text",
    "flawedMemo": "Original flawed AI memo",
    "auditMarks": [
      {
        "statementId": "s2",
        "decision": "revise",
        "category": "factual error",
        "note": "64% said try below HKD 18, not buy."
      }
    ],
    "studentPrompt": "Rewrite using only the brief..."
  },
  "provider": {
    "protocol": "anthropic-messages",
    "model": "claude-sonnet",
    "apiKeyEnv": "ANTHROPIC_API_KEY"
  },
  "includeProviderPayloadPreview": true
}
```

Response:

```json
{
  "id": "run-id",
  "agent": "revision",
  "status": "ready-for-live-provider",
  "output": {
    "revisedMemo": "...",
    "coachingNotes": ["..."]
  },
  "providerPayloadPreview": {},
  "warnings": ["Live provider execution is not enabled yet."]
}
```

## Supported Provider Protocols

The internal adapter supports these protocol families:

- `openai-responses`
- `openai-chat-completions`
- `anthropic-messages`
- `gemini-generate-content`
- `custom-http`

This covers the practical majority of current hosted LLM APIs:

- OpenAI's Responses API uses `POST /v1/responses` and supports text, JSON, tools, multimodal inputs, and stateful response flows.
- OpenAI-compatible chat completion APIs use a `model` plus `messages` structure and are also used by providers such as Mistral.
- Anthropic's Messages API accepts JSON request bodies and returns JSON response bodies, with `system` content separated from the turn messages.
- Google's Gemini API uses `models.generateContent`, with `contents`, `parts`, and optional `systemInstruction`.

## Design Decisions

### 1. Provider-Neutral Internal Contract

The UI and classroom logic should never build provider-specific payloads directly. They call:

- `createMaterialAgentMessages`
- `createRevisionAgentMessages`
- `buildProviderPayload`

This prevents the product from being rewritten every time the model provider changes.

### 2. Historical Classroom Data Is First-Class Input

The material generator receives:

- prior detection rates,
- common missed categories,
- weak prompt patterns,
- instructor notes.

This lets the agent generate harder or more targeted future material.

### 3. Mock First, Live Later

Current endpoints return mock outputs plus optional provider payload previews. This keeps the MVP stable while making the live integration path explicit.

### 4. Keys Are Referenced, Not Sent

Requests should include `apiKeyEnv`, not raw API keys. The server should resolve environment variables in the future live executor.

### 5. Instructor Remains Final Authority

Agent-generated materials and scoring suggestions should be treated as drafts. The instructor approves final material and rubric anchors before class.

## Implementation Files

- Agent contracts and adapters: `src/lib/agent-api.ts`
- Material endpoint: `src/app/api/agents/materials/route.ts`
- Revision endpoint: `src/app/api/agents/revision/route.ts`
- Adapter tests: `src/lib/agent-api.test.ts`

## Source Notes

- Next.js Route Handlers are defined as `route.ts` files inside the `app` directory and support HTTP methods such as `POST`: https://nextjs.org/docs/app/getting-started/route-handlers
- OpenAI Responses API creates model responses through `POST /v1/responses`: https://platform.openai.com/docs/api-reference/responses
- OpenAI Chat Completions API uses chat messages and supports JSON schema response formats: https://platform.openai.com/docs/api-reference/chat/create-chat-completion
- Anthropic's API accepts JSON request bodies and returns JSON response bodies: https://docs.anthropic.com/en/api/overview
- Google's Gemini API exposes standard content generation through `models.generateContent`: https://ai.google.dev/api/generate-content
- Mistral's Chat Completion API accepts a list of chat messages and returns an assistant message: https://docs.mistral.ai/studio-api/conversations/chat-completion

