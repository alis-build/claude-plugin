# Contributing

Thanks for helping improve the Alis Build plugin for Claude Code. This guide
covers how the repository is laid out, the checks a change must pass, and how
versions and pull requests work.

## Before you start

- Problems with the `alis` CLI itself, the Alis Build platform or your account
  belong with Alis Build support, not this repository. Issues here are for the
  plugin: its hooks, skills, primer and the function-hooks module.
- Never post secrets, tokens, `.env` contents or `--reveal` output in an issue,
  pull request or test fixture. This repository is public. Report security
  problems privately, as [SECURITY.md](SECURITY.md) describes.
- For anything larger than a fix, open an issue first so the approach can be
  agreed before you write it.

## Layout

| Path | What lives there |
| --- | --- |
| `.claude-plugin/marketplace.json` | The marketplace entry installers resolve |
| `plugins/alis-build/.claude-plugin/plugin.json` | The plugin manifest |
| `plugins/alis-build/hooks/*.sh`, `*.py`, `hooks.json` | Shell hooks (every Claude Code version) |
| `plugins/alis-build/hooks/mod.ts`, `hooks/mod/` | Function-hooks module (Claude Code 2.1.287+) |
| `plugins/alis-build/skills/` | `discover`, `capture`, `handoff`, `frontend-preview` |
| `plugins/alis-build/context/` | The DBD primer and digest injected at session start |
| `plugins/alis-build/tests/` | Module tests (`claude plugin test`) |
| `plugins/alis-build/evals/` | Uplift evals for the `discover` skill |
| `tests/` | Release guard, shell hook tests, Python behaviour tests, routing eval |

### The shell hooks and the module do the same jobs

The plugin runs in two modes: shell hooks everywhere, and the in-process
module where Claude Code's function hooks are on. **A behaviour change to one
side usually needs the same change on the other.** The permission gate is the
strictest case: the module's port (`hooks/mod/cli-gate.ts`) must give the
Python gate's answers (`hooks/cli-hook.py`), and
`plugins/alis-build/tests/parity.test.ts` checks every recorded case. If you
change the gate, change both and regenerate `tests/fixtures/parity.ts` with the
snippet at the top of `parity.test.ts`. The README's "Function hooks" section
explains how the two sides avoid running a job twice.

## Checks

CI (`.github/workflows/ci.yml`) runs the release guard and the shell and Python
tests on every push and pull request. Run them locally first:

```sh
tests/release-guard.sh
tests/sync-skills-hook-test.sh
tests/load-primer-hook-test.sh
PYTHONDONTWRITEBYTECODE=1 python3 tests/test_behavior.py
PYTHONDONTWRITEBYTECODE=1 python3 tests/test_handoff.py
tests/routing-eval.sh --dry-run
```

CI does not run the module checks, so run these yourself when you touch
`hooks/mod.ts` or `hooks/mod/`:

```sh
claude plugin validate plugins/alis-build
claude plugin test plugins/alis-build
npx -p typescript tsc -p plugins/alis-build/tsconfig.json
```

The typecheck needs the engine's declarations in
`plugins/alis-build/.claude-plugin/types/`. Claude Code writes them (gitignored)
each time a session loads the module, so open one session with the plugin
first. Use `npx -p typescript tsc`: a bare `npx tsc` can fetch an unrelated
package named `tsc`.

To try a change live:

```sh
claude --plugin-dir /absolute/path/to/plugins/alis-build --debug
```

`/alis` is registered at session start, so restart the session after editing
`hooks/mod.ts`.

The `discover` evals cost real API money; run them only when you change that
skill's routing. See `plugins/alis-build/evals/README.md`.

## Versions

Every user-visible change bumps the version, in all three places at once:

- `plugins/alis-build/.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `plugins/alis-build/hooks/mod/meta.ts` (`PLUGIN_VERSION`)

`tests/release-guard.sh` fails when they disagree. Use a patch bump for fixes
and a minor bump for features. Maintainers tag releases `vX.Y.Z` on `main`, and
a tag build runs the guard in strict mode, which also fails on any leftover
`__PLACEHOLDER__` marker.

## Commits and pull requests

- Commit subjects follow `type: summary`, with the version when the commit
  bumps it: `feat: v0.32.0 live operation row`, `fix: v0.31.0 drop ambient
  skill suggestions`. Types used here: `feat`, `fix`, `docs`, `chore`, `style`,
  `test`.
- Keep a pull request to one change. Update the README when behaviour a user
  can see changes.
- Fill in the pull request template's test plan with what you actually ran.
  Leave a box unticked rather than tick what you didn't check.
- Pull requests from forks: leave "Allow edits by maintainers" on, so small
  fixes can be pushed to your branch rather than sent back.

## License

By contributing you agree that your contribution is licensed under the
repository's [MIT License](LICENSE).
