---
name: handoff
description: Continue the current claude CLI session on an enrolled Alis workstation in herdr. Use when the user wants to hand off work or close their laptop while it continues remotely.
---

Hand this claude CLI session to the user's Alis workstation. The coordinator does
the work; you run one command and reply with one line.

1. Run `alis workstation handoff --session <current session id> --json`, using the
   session ID from hook context. Do not list targets first: with one enrolled
   workstation in this organisation it is chosen automatically. If the command
   answers "choose --to from enrolled workstation aliases: …", ask the user which
   one and rerun with `--to <alias>`.
2. Reply with one short line, such as "Handing off to <alias>; progress is in the
   popup." (or "in the Alis handoff pane" when the plugin's function hooks are on,
   which show it beside the transcript instead of a popup), and end your turn. Do not call more tools, poll status, or write a
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
