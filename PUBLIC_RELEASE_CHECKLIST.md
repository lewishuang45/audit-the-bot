# Public Release Checklist

Use this checklist before making the repository public, linking it in job
applications, or piloting it with a class.

## Safety

- [ ] No real API keys, service tokens, deployment names, private endpoints, or
      credentials are committed.
- [ ] No private student data is included in source, docs, screenshots, exports,
      tests, or sample files.
- [ ] No real classroom submissions are committed.
- [ ] No personal identifiers, email addresses, phone numbers, or private file
      paths are included.
- [ ] No live provider execution is enabled without server-side key handling.
- [ ] No raw API keys are sent from the client or stored in browser storage.
- [ ] Instructor approval remains required for generated lesson materials.
- [ ] The sample lesson content is original, synthetic, and safe for public use.

## Demo Boundary

- [ ] README explains that the MVP is demo-first and suitable for controlled
      classroom trials.
- [ ] README explains the browser localStorage boundary and future backend plan.
- [ ] Vercel deployment notes say no provider keys are required for demo mode.
- [ ] Screenshots contain no private data.

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
