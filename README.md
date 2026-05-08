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

## Data Persistence

The app now writes shared classroom submissions to a local SQLite database through server API routes:

- `GET /api/submissions`
- `POST /api/submissions`
- `PATCH /api/submissions/:id`
- `DELETE /api/submissions`

By default the database file is:

```txt
./data/audit-the-bot.db
```

Set `SQLITE_PATH` to move it elsewhere.

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

## BTBworkflow Integration

Instructor mode can export:

- raw submission JSON,
- `audit_the_bot_analytics.csv`,
- BTBworkflow dataset schema,
- BTBworkflow analysis template.

See [docs/btbworkflow-integration.md](docs/btbworkflow-integration.md).

## Deployment Shape

The current deployment target is a single Node.js process on a VM with SQLite persistence. This is suitable for demos and small classroom trials. For larger concurrent usage, move the same submission model to PostgreSQL.
