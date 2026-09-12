# Alis Build Claude Code Plugin

<p align="center">
  <img src="plugins/alis-build/assets/connectivity.svg" alt="Claude Code connected to Alis Build" width="760">
</p>

<p align="center">
  <strong>Connect Claude Code to Alis Build.</strong>
</p>

Use this plugin to let Claude Code work with Alis Build organisations, products, neurons, builds, and deploys through the `alis` CLI, with workspace-aware context injected into every session.

## What You Get

- A standing Define → Build → Deploy primer, so Claude knows the workflow, how to route requests, and to run the `alis` CLI — no trigger word required. The full primer loads inside `~/alis.build` workspaces; other directories get a compressed digest when the `alis` CLI is installed, and nothing otherwise (override with `ALIS_PRIMER=full|digest|off`)
- When a session opens inside a `~/alis.build/<org>/build|define/…` service folder, the package id and a pointer to its definitions ⇄ implementation counterpart are injected automatically
- Quiet, local-first discovery and capture skills: `alis-build:discover` fires on platform-shaped work (never on generic coding just because you are inside a workspace), probes the local catalog in ~40ms, and loads a registry skill only on a distinctive match; catalog metadata is refreshed quietly at session start and the plugin never installs or prunes native user skills
- Confidence-gated per-prompt skill suggestions (a `UserPromptSubmit` hook backed by `alis skills suggest`) — a suggestion appears only when the match is distinctive; wake phrases (`alis, …`, `capture this as a skill`) route from any directory
- Structured CLI workflows run with the CLI's automation tier; guarded actions use Claude's native confirmation

## Before You Start

You need:

- Claude Code v2.1.211 or later, installed and authenticated
- Bash, `jq`, and Python 3.9 or later available on `PATH`
- The [`alis` CLI](https://alis.build) installed, on your `PATH`, and signed in (`alis login`)
- An Alis Build account with access to the organisations and products you want to use

## Install

Add the Alis plugin marketplace:

```sh
claude plugin marketplace add https://github.com/alis-build/claude-plugin --sparse .claude-plugin plugins/alis-build
```

Install the Alis Build plugin:

```sh
claude plugin install alis-build@alis --scope user
```

Start Claude Code:

```sh
claude
```

For a repository-shared install, use project scope:

```sh
claude plugin install alis-build@alis --scope project
```

## Use It

Ask Claude Code to use Alis Build:

```text
build it
```

```text
fix it
```

```text
Use Alis Build to list the organisations I can access.
```

```text
Show recent builds for product os in organisation alis.
```

```text
Review the latest deploy logs for this neuron and suggest the next action.
```

Claude Code will ask before running tools that require approval.

Use one standalone `alis` command per Bash call. The plugin allows known read commands and structured Define/Build/Deploy/package workflows; the CLI's automation tier and production gate still apply. Arbitrary process runners, unknown commands and messaging verbs retain Claude's normal permission handling. Pipes, redirects and shell composition receive execution guidance and no automatic allow.

Use `alis --cwd /absolute/workspace/path ...` for another workspace, and `alis environment list <org>.<product> --json` to choose a target without fetching variable values. These require the CLI release containing the Claude reliability changes; check `alis --help` and `alis environment --help`. New logs/cancellation commands also need the matching backend.

Guarded actions (`--confirm-production`, `--approve`, `--yes`, block uninstall and environment unset) request native confirmation of the exact command. When needed, the hook includes `--approve` in the command shown for confirmation so the CLI does not ask a second time; it never inserts `--confirm-production`. Plan mode cannot run these actions. Higher-priority Claude rules/classifier denials remain in force. Session attribution uses a per-command `--session-id`; no shared approval file is written or trusted for Claude. `auto` and `acceptEdits` are not consent to external actions.

`ALIS_ALLOWED_SUBCMDS` restricts automatic allows (for example `context doctor operations`); it does not disable required confirmation. Missing Python causes the permission hook to fall back to Claude's normal handling.

## Skills

### Resume on my workstation

Use `/alis-build:handoff` to move a local Claude session and its unfinished
build/Define work to an enrolled workstation. The CLI prepares the destination,
waits for the current turn and tools to finish, gracefully stops the source,
and resumes in a persistent workstation terminal. Keep the laptop open until
`alis workstation handoff status <id> --json` reports `safe_to_close: true`.
Run status in a separate terminal; polling from the source Claude turn prevents
that turn from reaching its handoff boundary.

This requires the handoff-enabled CLI/workstation image, this plugin on both
machines, matching Claude Code versions (2.1.269 or later in the 2.1 series),
Python 3.9+, and independent Claude authentication on the destination. Existing
SSH enrolment supplies the connection and host verification. The destination
may request workspace trust or normal tool permissions in its browser terminal.
Local commits and non-ignored uncommitted changes travel with the transcript;
global credentials, unrelated sessions and running processes do not. Source
files are retained for recovery. Read `alis docs handoff` for limits and
cancellation. Reverse transfer is outside v1.

The lifecycle hook quietly skips older CLIs when no handoff is active. An active
handoff claim blocks new local tools/prompts if the coordinator is unavailable.
The handoff command follows Claude's normal permission handling.

### Discovery and capture

Discovery is skill-native: describe platform-shaped work in your own words and the `alis-build:discover` skill routes it — local catalog probe first, registry skill loaded only on a distinctive match, silence otherwise. Say "capture this as a skill" after solving something new and `alis-build:capture` saves it for your team. If you installed or changed the plugin inside an already-running Claude Code session, run `/reload-plugins`.

## Troubleshooting

If the primer or commands do not appear, confirm that the plugin install completed successfully:

```sh
claude plugin install alis-build@alis --scope user
```

If you installed or changed the plugin inside an already-running Claude Code session, reload plugins:

```text
/reload-plugins
```

If `alis` commands fail with an auth error, run `alis login` (or `alis authorise <org>.<product>` for git/package credentials) and retry.

`alis doctor --json` reports cached Claude plugin versions, missing hooks, the last observed hook path and the last catalog refresh outcome. These are observations, not verification of the active session. Local observations contain no commands, transcripts or credentials. Skill refresh uses Claude's native async hook lifecycle with its own 20-second deadline.

## Development checks

Run `RELEASE_GUARD_STRICT=1 tests/release-guard.sh`, the two shell hook tests,
`PYTHONDONTWRITEBYTECODE=1 python3 tests/test_behavior.py`, and
`tests/routing-eval.sh --dry-run`. Behavioral tests use temporary homes and stub
executables; no deployment, uninstall or message is sent.
Also run `PYTHONDONTWRITEBYTECODE=1 python3 tests/test_handoff.py` for lifecycle,
source-claim and permission-routing checks.

Live routing evaluation is opt-in: `tests/routing-eval.sh --live /path/to/disposable-fixture
--results /tmp/routing-scores.json`. Use a disposable workspace and a stub `alis`
executable, because prompts include mutation-shaped work. Each prompt gets empty
stdin. Scores inspect actual tool events, including `skills suggest`; quiet no-match
results are valid. Failures, denials, missing final results and incomplete case counts
fail evaluation. Response text mentioning discovery is not tool-use evidence.
