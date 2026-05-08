# Audit the Bot

Audit the Bot is a classroom simulation app for teaching critical evaluation and active steering of AI outputs.

Students complete a guided flow:

1. read a business brief,
2. write a human-only baseline,
3. audit a flawed AI memo,
4. write a targeted revision prompt,
5. compare a revised AI memo,
6. submit a final human-edited memo and rationale.

Instructors can monitor progress, inspect submissions, assign rubric scores, and export results.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm test
npm run build
npm run test:e2e
npm audit --omit=dev
```

## Agent API Surface

The project includes provider-neutral mock endpoints for future live agent integration:

- `POST /api/agents/materials`
- `POST /api/agents/revision`

See [docs/agent-api-design.md](docs/agent-api-design.md).

## Deployment Shape

The current MVP stores class data in browser `localStorage`, so it is best for demos and controlled trials. For real classroom use, the next backend step is persistent session storage.

