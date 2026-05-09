# Agent API Design

Audit the Bot is intentionally provider-neutral. Classroom logic should not know
whether a future live run uses OpenAI, Anthropic, Gemini, an OpenAI-compatible
provider, or a custom internal HTTP service.

## Current Status

The current endpoints are mock-first:

- `POST /api/agents/materials`
- `POST /api/agents/revision`

They return deterministic demo outputs and, when requested, a provider payload
preview. They do not call live model providers. This keeps the MVP safe for
public demos, classroom pilots, and recruiter review without requiring secrets
or paid API access.

## Agent Roles

### `material-generator`

Future purpose: generate a draft lesson pack from instructor constraints and
historical classroom performance.

Expected draft sections:

- business brief
- flawed AI memo
- hidden answer key and issue categories
- rubric anchors
- sample revision prompt
- sample revised memo
- sample final memo
- instructor notes

Generated materials are drafts. The instructor approves the final case, answer
key, and rubric before students use them.

### `revision`

Future purpose: revise a flawed AI memo using the business brief, student audit
marks, and the student's targeted revision prompt.

The revision agent should use only provided classroom material. It should not
invent facts, add unsupported claims, or override the instructor's rubric.

## Request Pattern

Requests use a provider-neutral envelope:

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
    "protocol": "openai-responses",
    "model": "future-model-name",
    "apiKeyEnv": "OPENAI_API_KEY",
    "temperature": 0.4,
    "maxOutputTokens": 1600
  },
  "includeProviderPayloadPreview": true
}
```

Important safety rule: browser clients should never send raw API keys. Future
live execution should resolve `apiKeyEnv` on the server only.

## Response Pattern

Mock mode returns structured output plus warnings when a provider is supplied:

```json
{
  "id": "run-id",
  "agent": "revision",
  "status": "ready-for-live-provider",
  "output": {
    "revisedMemo": "Deterministic mock memo...",
    "coachingNotes": ["Mock mode keeps classroom output stable."]
  },
  "providerPayloadPreview": {},
  "warnings": [
    "Live provider execution is not enabled yet. This response includes a provider payload preview only."
  ]
}
```

## Supported Provider Protocols

The adapter currently builds payload previews for:

- `openai-responses`
- `openai-chat-completions`
- `anthropic-messages`
- `gemini-generate-content`
- `custom-http`

The revision endpoint can now execute a live Gemini call when `ATB_LIVE_AI=true`
and `GEMINI_API_KEY` are configured on the server. Other provider protocols and
the material-generation endpoint remain preview/mock contracts.

## Design Principles

### Mock First

The MVP is a classroom simulation and public demo. Deterministic output is a
feature because students can compare reasoning without model randomness changing
the exercise mid-session.

### Provider-Neutral Classroom Logic

The UI and scoring logic call shared helpers:

- `createMaterialAgentMessages`
- `createRevisionAgentMessages`
- `buildProviderPayload`

Provider-specific request shapes stay behind the adapter boundary.

### Server-Side Secrets Only

Future live provider execution must use environment variables such as:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`

Raw keys must not be stored in localStorage, committed to git, included in
browser requests, or exported with classroom data.

### Instructor Authority

The instructor remains the final authority for:

- lesson approval
- hidden answer key approval
- rubric calibration
- final student scores
- decisions about whether generated material is suitable for a class

Agent outputs are aids, not graders of record.

### No Vendor Lock-In

Classroom concepts such as briefs, audit marks, prompts, rationales, and rubric
scores should remain stable even if the model provider changes. The app should
not couple student progress, storage, or scoring to one LLM vendor's response
format.

## Endpoint Details

### `POST /api/agents/materials`

Purpose: preview a future material-generation run.

Required input:

- `agent: "material-generator"`
- `input.courseTopic`
- `input.targetSkill`

Optional input:

- `input.previousSessions`
- `input.constraints`
- `provider`
- `includeProviderPayloadPreview`

### `POST /api/agents/revision`

Purpose: preview a future memo-revision run.

Required input:

- `agent: "revision"`
- `input.businessBrief`
- `input.flawedMemo`

Optional input:

- `input.auditMarks`
- `input.studentPrompt`
- `provider`
- `includeProviderPayloadPreview`

## Implementation Files

- Agent contracts and adapters: `src/lib/agent-api.ts`
- Material endpoint: `src/app/api/agents/materials/route.ts`
- Revision endpoint: `src/app/api/agents/revision/route.ts`
- Sample lesson pack: `src/data/sampleLesson.ts`
- Adapter tests: `src/lib/agent-api.test.ts`

## Future Live Execution Requirements

Before enabling live provider calls:

1. Add server-only provider executors for each provider.
2. Validate all incoming request bodies.
3. Resolve API keys from server environment variables only.
4. Add provider timeout, retry, and rate-limit behavior.
5. Log metadata without storing raw prompts that contain student identifiers.
6. Keep instructor approval required for generated materials.
7. Add tests that prove raw keys are never accepted from the browser.
