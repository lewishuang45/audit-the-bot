# BTBworkflow Integration

## Current Compatibility

`BTBworkflow` is a Python CSV analysis workflow. Its current default schema expects numeric columns such as:

- `Individual`
- `AI`
- `CoachedAI`
- `AugPair`
- `Team`
- `AugT`

Audit the Bot now exports a compatible CSV from the instructor dashboard:

- `audit_the_bot_analytics.csv`
- `audit_the_bot_dataset_schema.json`
- `audit_the_bot_analysis_template.json`

## Data Mapping

The first integration layer converts classroom activity records into analysis-ready metrics.

| Audit the Bot Field | BTBworkflow Column | Meaning |
| --- | --- | --- |
| Human-only baseline text | `Individual` | Heuristic baseline quality score, 0-100 |
| Original flawed memo | `AI` | Fixed flawed-AI reference score, currently 35 |
| Student prompt + detection rate | `CoachedAI` | Heuristic quality of coached AI revision input, 0-100 |
| Final memo or instructor rubric | `AugPair` | Final human-AI output quality, 0-100 |
| Known issue detection rate | `Team` | Detection rate, 0-100 |
| Coached/final blended score | `AugT` | Combined collaboration score, 0-100 |

For MVP, `Individual` and `CoachedAI` are heuristic scores. `AugPair` uses the instructor rubric total when available; otherwise it falls back to final memo text quality heuristics.

## Manual Workflow

1. Run an Audit the Bot session.
2. Open Instructor mode.
3. Export:
   - `BTBworkflow CSV`
   - `Schema`
   - `Template`
4. In `BTBworkflow`, place the CSV at:

   ```txt
   datasets/audit_the_bot_analytics.csv
   ```

5. Replace or copy the schema to:

   ```txt
   dataset_schema.json
   ```

6. Replace or copy the template to:

   ```txt
   analysis_template.json
   ```

7. Run:

   ```bash
   python run_workflow.py --stage report
   ```

## Future Direct Connection

The clean direct connection should be one of these:

### Option A: GitHub Actions Dispatch

Audit the Bot sends a `repository_dispatch` event to `BTBworkflow`, with a signed payload containing either:

- CSV artifact URL, or
- JSON payload that BTBworkflow converts into CSV.

Best for async report generation.

### Option B: BTBworkflow API Service

Wrap BTBworkflow with an HTTP endpoint:

```txt
POST /workflow/runs
```

Payload:

```json
{
  "dataset": {
    "format": "csv",
    "content": "..."
  },
  "schema": {},
  "template": {}
}
```

Best when the workflow becomes a long-running analytics backend.

### Option C: Shared Object Storage

Audit the Bot writes CSV/schema/template files into Azure Blob Storage. BTBworkflow watches or pulls from that storage path.

Best for classroom-scale batches and persistent artifacts.

## Recommended Next Step

Use the manual CSV/schema/template export first. Once the data shape proves useful, add a server-side run endpoint in Audit the Bot:

```txt
POST /api/analytics/btbworkflow/export
POST /api/analytics/btbworkflow/dispatch
```

The first endpoint produces workflow files; the second triggers BTBworkflow through GitHub Actions or a dedicated workflow API.

