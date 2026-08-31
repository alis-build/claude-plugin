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
- The `alis` CLI auto-approved in Claude Code, so command-line calls run without a permission prompt each time

## Before You Start

You need:

- Claude Code installed and authenticated
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

The plugin auto-approves single, simple `alis ...` shell commands so the CLI runs without a permission prompt each time. For safety it only approves a lone invocation — anything that chains or redirects (`|`, `&&`, `||`, `;`, `&`, `>`, `<`, backticks, `$(...)`) falls through to Claude Code's normal permission flow. To restrict which subcommands are auto-approved, set `ALIS_ALLOWED_SUBCMDS` to a space-separated allowlist (e.g. `ALIS_ALLOWED_SUBCMDS="define build deploy operations"`); unset means every `alis` subcommand is approved.

## Skills

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
