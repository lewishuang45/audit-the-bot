# PRD: Audit the Bot

## 1. Product Summary

Audit the Bot is a classroom simulation web application based on the two MSBA 7041 assignment drafts. It trains college students in one human-AI collaboration skill: critical evaluation and active steering of AI outputs.

The product turns the paper-based simulation into a guided 60-minute activity where students:

1. form an independent human-only recommendation,
2. audit a flawed AI-generated business memo,
3. write targeted revision prompts,
4. review the revised AI output,
5. produce a final human-AI edited memo,
6. reflect on what human judgment improved.

The core product claim is not "AI writes better answers." The claim is: students learn to identify weak AI output, guide it with better instructions, and retain responsibility for the final decision.

## 2. Source Inputs

Primary source documents:

- `/Users/lewishuang45/Desktop/Study/HKU/M5/7041/Ass/MSBA 7041 Assignment1.pdf`
- `/Users/lewishuang45/Desktop/Study/HKU/M5/7041/Ass/MSBA 7041 Assignment2.pdf`

Assignment 1 defines the skill: critical evaluation and active steering of AI outputs.

Assignment 2 defines the simulation: "Audit the Bot," including learning objectives, 60-minute flow, human-only baseline, AI-only audit, coached AI revision, final human-AI editing, debrief, and 10-point rubric.

## 3. Assumptions

- The first build is a web application, not a native mobile app.
- The primary use case is an instructor running a live class session.
- Students can join via a session code or link; full account registration is not required for MVP.
- The MVP should work for one case scenario first, likely the beverage launch case described in the assignment.
- The AI-generated flawed memo can be prewritten for consistency in MVP.
- Real AI revision can be added through an LLM provider, but should be abstracted behind a replaceable service.
- The product should support English output first, with Chinese UI or bilingual support optional.

## 4. Target Users

### Instructor

The instructor creates or starts a simulation, gives students the session link, monitors progress, reviews submissions, and uses dashboard results during debrief.

### Student Participant

The student completes the simulation individually first, then may work in pairs for prompt revision and final editing.

### Teaching Assistant

The teaching assistant may review submissions, score outputs, export results, or help facilitate debrief.

## 5. Goals

- Convert the assignment's paper simulation into a repeatable digital classroom activity.
- Preserve the learning structure: human-only baseline, AI audit, guided AI revision, human final editing.
- Make student reasoning visible, not just the final answer.
- Support scoring against the 10-point rubric from the assignment.
- Provide instructors with a simple dashboard for progress, common mistakes, and score improvement.

## 6. Non-Goals for MVP

- No marketplace of simulations.
- No complex LMS integration.
- No fully automated grading as the only source of truth.
- No multi-course user management.
- No open-ended chatbot interface where students can use AI freely without constraints.
- No attempt to prove long-term learning impact in the software itself.

## 7. User Journey

### Instructor Flow

1. Create a session from the "Audit the Bot" template.
2. Configure case title, timing, flawed AI memo, known issues, and rubric.
3. Start the session and display or share a join link.
4. Monitor participants by stage.
5. Review student/pair outputs.
6. View class-level debrief metrics.
7. Export submissions and scores.

### Student Flow

1. Join session with name or anonymous participant ID.
2. Read the business brief.
3. Write a human-only baseline recommendation.
4. Audit the flawed AI memo by tagging statements as accept, question, revise, or reject.
5. Identify factual errors, unsupported claims, budget mismatch, weak recommendations, or tone/ethics problems.
6. Write one or two targeted revision prompts.
7. Generate or receive a revised AI memo.
8. Compare original AI memo and revised AI memo.
9. Edit final memo.
10. Explain which AI suggestions were accepted, revised, or rejected.
11. Submit final response.

## 8. Core Requirements

### R1. Session Template

The app must include an "Audit the Bot" activity template with six stages:

- introduction and briefing,
- human-only baseline,
- AI-only audit,
- coached AI revision,
- human-AI final editing,
- debrief and reflection.

### R2. Business Brief

The app must show students a case brief with enough constraints to support meaningful evaluation:

- target customer,
- budget,
- competitors,
- survey findings,
- distribution restrictions,
- brand considerations,
- decision goal.

### R3. Human-Only Baseline

Students must submit an independent short recommendation before seeing the AI memo. This prevents blind anchoring on AI output.

### R4. AI Memo Audit

Students must review a flawed AI memo and mark issues. The audit interface should support:

- statement-level highlights,
- issue category tagging,
- notes explaining the problem,
- accept/question/revise/reject decisions.

Issue categories should include:

- factual error,
- unsupported claim,
- budget mismatch,
- target market mismatch,
- vague recommendation,
- ethical or tone risk,
- missing evidence,
- logical weakness.

### R5. Coached AI Revision

Students must write targeted prompts based on their audit findings. The prompt editor should encourage specificity:

- what flaw to fix,
- what constraint to respect,
- what output format is expected,
- what evidence can be used.

For MVP, this can either:

- call a real LLM through a backend API, or
- select from deterministic prewritten revised memos based on prompt quality.

### R6. Final Human-AI Editing

Students must produce a final memo after reviewing the revised AI output. The final submission must include:

- final recommendation memo,
- short explanation of accepted AI content,
- short explanation of revised AI content,
- short explanation of rejected AI content.

### R7. Rubric-Based Scoring

The product must support the 10-point rubric from the assignment:

| Dimension | Score |
| --- | ---: |
| Verify Accuracy | 0-3 |
| Modification Quality | 0-3 |
| Guidance Effectiveness | 0-2 |
| Quality of Argumentation | 0-2 |

For MVP, scoring can be instructor-assisted. Automated hints can be added later.

### R8. Instructor Dashboard

The instructor dashboard should show:

- number of participants by stage,
- common issue categories found,
- issue detection rate against known answer key,
- original AI memo score vs final edited memo score,
- prompt quality distribution,
- exportable submissions.

### R9. Debrief Support

The app should provide debrief prompts:

- Which mistakes were easiest to miss?
- Did AI revision solve the real problem or only improve wording?
- At which stage did human intervention add the most value?
- Which prompts failed to improve the answer?

## 9. Suggested MVP Scope

The MVP should be narrow:

- one fixed simulation template,
- one fixed case brief,
- one prewritten flawed AI memo,
- one known issue answer key,
- one participant flow,
- one instructor dashboard,
- export to CSV or JSON,
- optional real LLM revision behind a feature flag.

This is enough to test whether the learning activity works before investing in broader platform features.

## 10. Suggested Tech Stack

Recommended default:

- Framework: Next.js with TypeScript
- UI: React + Tailwind CSS
- Data for MVP: SQLite with Prisma, or local JSON for prototype only
- Authentication: session code and participant display name for MVP
- AI integration: backend LLM adapter, disabled or mocked by default
- Testing: Vitest for unit tests, Playwright for end-to-end browser flow

The most important architecture decision is to keep the simulation engine separate from the AI provider. The educational flow should still work even if the real AI API is unavailable.

## 11. Data Model Draft

Core entities:

- `SimulationTemplate`: activity structure, stages, rubric, default materials.
- `Session`: one live class run of a template.
- `Participant`: student identity within a session.
- `CaseBrief`: business scenario and constraints.
- `AIMemo`: original flawed memo and revised memo versions.
- `KnownIssue`: instructor-defined issue in the flawed memo.
- `AuditMark`: participant's tagged critique of AI output.
- `PromptAttempt`: participant's revision prompt.
- `FinalMemo`: final edited output and rationale.
- `RubricScore`: instructor or assisted scoring record.

## 12. Success Criteria

The MVP is successful when:

- An instructor can start a session in under 3 minutes.
- A student can complete all stages without external instructions.
- The app preserves the intended 60-minute activity structure.
- Students cannot skip the human-only baseline before seeing AI output.
- The audit stage captures issue categories and written reasoning.
- The final memo requires accept/revise/reject rationale.
- Instructor can see stage progress and export submissions.
- A complete class run can be reviewed after the session.

## 13. Open Questions

- Should the first version use real AI generation, or deterministic prewritten revised memos?
- Should the UI be English-only, Chinese-only, or bilingual?
- Is the deliverable meant for actual classroom use, a portfolio demo, or an assignment artifact?
- Do students need pair collaboration inside the app, or can pairing happen offline?
- Who scores the rubric: instructor, peer, self-assessment, or AI-assisted grader?
- Should the product store real student names, or use anonymous IDs to reduce privacy risk?
- What exact business case should be used in the first template?
- Should the final output be a memo, a slide, or both?

