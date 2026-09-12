---
name: handoff
description: Move the current local Claude Code conversation and unfinished Alis build/Define work to an enrolled Alis workstation and continue there. Use for "resume on my workstation", "hand this session over", or when the user explicitly wants to close their laptop while work continues on their workstation.
disable-model-invocation: false
---

# Resume on my workstation

Use the CLI handoff coordinator. Never copy ~/.claude wholesale, kill a process,
invent a session id, or start a second Claude instance yourself.

1. Identify the current session from `${CLAUDE_SESSION_ID}`. If unavailable,
   use the exact session id from the current hook context; never choose "last".
2. Run `alis workstation handoff targets --json`. The destination must be an
   enrolled workstation in the current organisation. If several qualify, ask
   which one; use the only eligible workstation automatically.
3. Compose a concise continuation instruction: remaining task, user constraints,
   completed external actions that must not be repeated, and next useful action.
   Wait for any tools or agents you started to finish. Recurring/background
   work must finish or be explicitly stopped before a safe handoff is possible.
4. Run one standalone command:
   `alis workstation handoff --session <session-id> --to <enrolled-alias> --instruction '<continuation instruction>' --json`.
   Apply normal literal shell quoting to the instruction. This starts a detached
   coordinator; the current Claude turn must end before transfer can proceed.
5. Give the user the returned status command, explain that the laptop must stay
   open until status reports `safe_to_close: true`, then end this turn. Do not
   poll from this Claude turn: doing so would prevent its own safe boundary.

Status is `alis workstation handoff status <handoff-id> --json`, run from a
separate local terminal. Its destination URL opens the persistent terminal.
Claude may need workspace trust or permissions there; do not bypass them.
Cancellation is `alis workstation handoff cancel <handoff-id> --json`; it stops
the remote continuation and only releases the local claim after acknowledgement.

V1 requires native Claude Code on macOS/Linux, matching supported Claude versions,
Python 3.9+, the handoff-enabled plugin on both machines, an enrolled SSH alias,
and Claude already authenticated on the workstation. It carries the paired
build/Define repos, including local commits and uncommitted non-ignored files.
Submodules, live processes, ignored dependencies/secrets, and reverse transfer
are unsupported. Original local work is retained. Never treat an unknown remote
status as permission to restart locally.
