Run a quick quality check on all changes since the last commit:

1. `npx tsc --noEmit` — type safety
2. `npm test` — test suite
3. `npm run lint` — lint check
4. `git diff --stat` — scope of changes

Report: PASS (all green) or FAIL (with specific errors).
Do not fix anything. Just report.
