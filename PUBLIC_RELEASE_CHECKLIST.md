# Public Release Checklist

Use this checklist before making the repository public, linking it in job
applications, or piloting it with a class.

## Safety

- [x] No real API keys, service tokens, deployment names, private endpoints, or
      credentials are committed.
- [x] No private student data is included in source, docs, screenshots, exports,
      tests, or sample files.
- [x] No real classroom submissions are committed.
- [x] No personal identifiers, email addresses, phone numbers, or private file
      paths are included.
- [x] No live provider execution is enabled without server-side key handling.
- [x] No raw API keys are sent from the client or stored in browser storage.
- [x] Instructor approval remains required for generated lesson materials.
- [x] The sample lesson content is original, synthetic, and safe for public use.

## Demo Boundary

- [x] README explains that the MVP is demo-first and suitable for controlled
      classroom trials.
- [x] README explains the browser localStorage boundary and future backend plan.
- [x] Vercel deployment notes say no provider keys are required for demo mode.
- [x] Screenshots contain no private data.

## Repository Metadata

- [x] MIT license is included for public GitHub release.
- [x] `package.json` declares the MIT license.
- [x] GitHub Actions CI is configured for tests, build, e2e, and audit on
      `main`.

## Validation Commands

```bash
npm install
npm test
npm run build
npm run test:e2e
npm audit --omit=dev
```

## Secret Scans

```bash
git grep -n -I -E "sk-|api[_-]?key|password|secret|token|endpoint|deployment|openai|anthropic|gemini|gmail|phone|/Users|C:\\\\"
git log --all -S "api_key"
git log --all -S "sk-"
```

Review matches manually. Some safe matches are expected in documentation where
environment variable names and future provider placeholders are described.
