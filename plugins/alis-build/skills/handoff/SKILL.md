---
name: handoff
description: Continue the current claude CLI session on an enrolled Alis workstation in herdr. Use when the user wants to hand off work or close their laptop while it continues remotely.
---

Hand this claude CLI session to the user's Alis workstation. The coordinator does
the work; you run one command and reply with one line.

1. Run `alis workstation handoff --session <current session id> --json`, using the
   session ID from hook context. Do not list targets first: with one enrolled
   workstation in this organisation it is chosen automatically. If the command
   answers `HANDOFF_CHOOSE_WORKSTATION`, ask the user which of their existing
   workstations to use and rerun with `--to <alias>`. If it answers
   `HANDOFF_SESSION_NOT_REGISTERED` (usual in a desktop app whose Alis plugin hooks
   have not run in this session), do not rerun it: say in plain words that this
   conversation is not connected to handoff yet, keep the workstation the user
   chose, and offer `error.details.fallback` (`--detached --mode summary`: a new
   conversation on that same workstation from this folder while this one stays open)
   or a plugin reload (`/reload-plugins`, or reopen the app) and a new session. Every
   refusal carries `retry` and `agent`; follow them. `alis workstation handoff check
   --agent claude --session <id> --json` reports readiness without starting anything.
   Never show state file names, never invent a session id, never create a workstation.
2. Reply with one short line, such as "Handing off to <alias>; progress is in the
   popup.", and end your turn. Do not call more tools, poll status, or write a
   recap: the handoff waits for this turn to end, and further tool calls are denied.

Native continuation resumes this exact conversation on the workstation with
"Continue where you left off." If a local background task is running, stop it
first and keep its recoverable output; handoff waits until none remain. Keep exact
Alis operation IDs in the conversation: remote Define/Build/Deploy work continues
independently and the workstation resumes watching it.

The user can drive handoff without you: in herdr, `prefix+t` hands off the focused
agent pane and the pane then becomes the live workstation session; `prefix+u`
lists handoffs and brings one back. Elsewhere use
`alis workstation handoff status <id> --watch`, `open <id>`, `reclaim <id>` or
`cancel <id>`.

Never copy agent homes, kill processes, invent session IDs, or start a second
continuation. Uncertain remote status never permits resuming locally.
