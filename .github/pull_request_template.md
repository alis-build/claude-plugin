## Summary

<!-- What changes for the person using the plugin, and why. Link the issue: Fixes #123 -->

## How it works

<!-- The files that matter and anything a reviewer should look at first. -->

## Checklist

- [ ] Version bumped in `plugin.json`, `marketplace.json` and `hooks/mod/meta.ts` (user-visible changes only)
- [ ] README updated for behaviour a user can see
- [ ] Shell hooks and the function-hooks module still agree (if either changed)
- [ ] No secrets, tokens or real environment values in code, fixtures or this description

## Test plan

<!-- Tick only what you ran. Delete lines that don't apply. -->

- [ ] `tests/release-guard.sh`
- [ ] Shell and Python hook tests (`tests/*-hook-test.sh`, `tests/test_behavior.py`, `tests/test_handoff.py`)
- [ ] `tests/routing-eval.sh --dry-run`
- [ ] `claude plugin validate plugins/alis-build`
- [ ] `claude plugin test plugins/alis-build`
- [ ] `npx -p typescript tsc -p plugins/alis-build/tsconfig.json`
- [ ] Tried live with `claude --plugin-dir …` (say which Claude Code version and terminal)
