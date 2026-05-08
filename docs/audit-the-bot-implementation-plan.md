# Implementation Plan: Audit the Bot

## 1. Recommended Build Strategy

Build the project in three levels:

1. Clickable prototype: validate flow, screens, and timing.
2. MVP web app: run one real classroom session end to end.
3. Expandable platform: add multiple cases, richer analytics, accounts, and reusable templates.

The safest first implementation is an MVP that uses a fixed case and a prewritten flawed AI memo. Real AI can be added later once the educational flow is stable.

## 2. Architecture Direction

### Frontend

Use a stage-based web interface:

- instructor dashboard,
- participant session flow,
- audit/highlight interface,
- prompt writing panel,
- revised AI comparison view,
- final memo editor,
- debrief results view.

### Backend

Keep backend responsibilities simple:

- session creation,
- participant progress tracking,
- submissions,
- rubric scores,
- optional AI revision request.

### AI Adapter

Define an AI adapter with two modes:

- `mock`: deterministic revised memo, useful for demos and classroom consistency.
- `live`: sends structured prompts to a model provider and records the output.

This avoids making the whole product dependent on AI latency, cost, or nondeterministic answers.

## 3. Milestones

### Milestone 0: Product Clarification

Goal: decide what the first build is actually for.

Tasks:

- Confirm whether this is for assignment demonstration, classroom deployment, or portfolio project.
- Choose language: English, Chinese, or bilingual.
- Decide mock AI vs live AI for first version.
- Finalize the first business case and flawed AI memo.
- Define what "good enough to proceed" means.

Deliverable:

- Approved PRD and first-scope decision.

### Milestone 1: Flow Prototype

Goal: make the activity feel real without heavy backend work.

Tasks:

- Create app shell and stage navigation.
- Build student flow screens.
- Build instructor preview/dashboard placeholder.
- Add static business brief and flawed AI memo.
- Add final submission screen.

Acceptance criteria:

- A user can move through all six stages.
- The order matches the assignment design.
- Human-only baseline is shown before AI memo.
- No data persistence is required beyond browser state.

### Milestone 2: Core MVP

Goal: persist a real class session.

Tasks:

- Add session creation and join code.
- Store participant progress.
- Store baseline, audit marks, prompts, revised memo, final memo, and rationale.
- Add instructor dashboard with participant status.
- Add export.

Acceptance criteria:

- Instructor can create one session and share a join link.
- Multiple participants can submit independently.
- Instructor can see who is at which stage.
- Submissions survive page refresh.
- Export includes all major student artifacts.

### Milestone 3: Audit and Scoring

Goal: make learning outcomes measurable.

Tasks:

- Add statement-level audit tagging.
- Add known issue answer key for the flawed AI memo.
- Add rubric scoring UI.
- Add simple detection-rate analytics.
- Add class debrief summary.

Acceptance criteria:

- Students can tag statements with issue categories.
- Instructor can compare student marks to known issues.
- Instructor can assign 10-point rubric scores.
- Dashboard shows common missed issues and final improvement indicators.

### Milestone 4: AI Revision

Goal: support coached AI revision without losing control of the simulation.

Tasks:

- Implement mock AI adapter first.
- Add live AI adapter as optional setting.
- Store prompt attempts and generated outputs.
- Add guardrails to keep output tied to the case brief.
- Add comparison view between original and revised AI memo.

Acceptance criteria:

- Prompt submission produces a revised memo.
- The system records prompt and output.
- Instructor can disable live AI and use deterministic output.
- Revised output can be compared with the original.

### Milestone 5: Polish and Demo Readiness

Goal: make the project presentable and usable.

Tasks:

- Improve responsive layout.
- Add timer or stage progress indicators.
- Add empty/loading/error states.
- Add seed data.
- Add tests for core flow.
- Prepare demo script.

Acceptance criteria:

- End-to-end Playwright test passes for instructor and student flows.
- App can be demoed from a clean checkout.
- No obvious UI overlap or broken navigation.

## 4. Proposed Task Breakdown

### Task 1: Scaffold Project

Acceptance:

- Next.js TypeScript app runs locally.
- Basic route structure exists for instructor and participant flows.
- Lint/build commands work.

Verify:

- `npm run dev`
- `npm run build`

### Task 2: Add Static Simulation Content

Acceptance:

- Business brief, flawed AI memo, known issues, and rubric live in structured seed data.
- Content can be rendered from data, not hardcoded into components.

Verify:

- Open participant flow and see case material.

### Task 3: Implement Student Stage Flow

Acceptance:

- Student can complete baseline, audit, prompt, final memo, and reflection stages.
- Stage order prevents seeing AI memo before baseline submission.

Verify:

- Manual browser test through complete flow.

### Task 4: Implement Audit Interface

Acceptance:

- Student can select or tag AI memo statements.
- Tags include accept, question, revise, reject.
- Issue category and note can be saved.

Verify:

- Submit at least three audit marks and reload the page.

### Task 5: Add Persistence

Acceptance:

- Session, participant, and submission data persist.
- Multiple participants can join the same session.

Verify:

- Create session, join from two browser contexts, submit different answers.

### Task 6: Add Instructor Dashboard

Acceptance:

- Instructor can see participant stage progress.
- Instructor can inspect individual submissions.
- Instructor can export session data.

Verify:

- Run one fake class session and export results.

### Task 7: Add Rubric Scoring

Acceptance:

- Instructor can score each participant on the 10-point rubric.
- Total score is calculated.
- Score can be exported.

Verify:

- Score one submission and confirm export includes score dimensions.

### Task 8: Add AI Adapter

Acceptance:

- Mock adapter returns deterministic revised memo.
- Live adapter can be configured later without changing UI flow.
- AI output is stored with the prompt.

Verify:

- Submit prompt and see revised AI memo in comparison view.

### Task 9: Add Tests and Demo Script

Acceptance:

- Unit tests cover core scoring calculations.
- End-to-end test covers student completion.
- Demo script explains instructor and student flows.

Verify:

- `npm test`
- `npm run build`
- Playwright flow passes.

## 5. Key Blockers and Potential Problems

### 1. The First Case Material Is Not Fully Written Yet

The assignment describes a beverage launch case, but the actual case brief, flawed AI memo, answer key, and ideal final memo are not fully specified in the drafts.

Impact: high.

Mitigation: write one complete canonical case before coding beyond prototype.

### 2. Real AI May Reduce Classroom Consistency

If students use live AI, outputs can vary across groups. This may make scoring and debrief harder.

Impact: high.

Mitigation: use a deterministic mock AI mode for MVP; add live AI as optional advanced mode.

### 3. The Rubric Needs Operational Detail

The 10-point rubric is clear at a high level, but each score band needs examples. For example, what separates 2/3 from 3/3 in Verify Accuracy?

Impact: medium-high.

Mitigation: create scoring anchors and sample submissions before real classroom use.

### 4. Pair Collaboration Is Ambiguous

The assignment says students first work individually, then in pairs. The app must decide whether pairs are managed digitally or handled offline.

Impact: medium.

Mitigation: for MVP, support individual submissions and let pairing happen offline. Add pair mode later if needed.

### 5. Timeboxing Can Become a UX Problem

The activity is designed for one hour. Strict timers may frustrate students; loose timers may make classroom facilitation harder.

Impact: medium.

Mitigation: make timers instructor-controlled and soft by default.

### 6. Automated Scoring Could Be Misleading

AI-assisted grading may be attractive, but it risks rewarding polished language instead of critical reasoning.

Impact: medium-high.

Mitigation: keep instructor scoring as source of truth; use automation only as a suggestion or summary.

### 7. Privacy and Consent Need Attention

If this is used with real students, submissions may count as educational data.

Impact: medium.

Mitigation: start with anonymous IDs and avoid collecting unnecessary personal data.

### 8. Scope Can Expand Quickly

This could turn into a full LMS, AI literacy platform, or analytics product.

Impact: high.

Mitigation: first build only one live activity with one template and one case.

## 6. Decision Points Before Proceeding

Before implementation, decide:

- Is the goal a class-ready tool or a polished demo?
- Should the MVP use mock AI, live AI, or both?
- What language should the interface use?
- Should submissions be anonymous?
- Should pair work be represented inside the product?
- Will we create the missing case materials now?
- Is deployment required, or is local demo enough?

## 7. Recommended Next Step

Do not start full implementation immediately. First create a complete simulation content pack:

- business brief,
- flawed AI memo,
- known issue answer key,
- sample high-quality prompt,
- sample revised AI memo,
- sample final memo,
- scoring anchors for each rubric dimension.

Once that content pack is approved, the product can be built cleanly around it.

