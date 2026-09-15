---
name: handoff
description: Continue the current claude CLI session on an enrolled Alis workstation in herdr. Use when the user wants to hand off work or close their laptop while it continues remotely.
---

Use the Alis coordinator; never copy agent homes, kill processes, invent session IDs,
or launch a second continuation yourself. This skill applies to the native CLI;
IDE and desktop app sessions need a verified CLI registration.

1. Use the current session ID from hook context (or the agent's session environment).
   Run `alis workstation handoff targets --json`; select the only enrolled target
   in this organisation, or ask which target if several qualify.
2. Native continuation preserves the conversation. Do not generate a recap or a
   long handoff prompt. The default is “Continue where you left off.” If a local
   background task must be stopped, preserve its recoverable output first. Record
   exact Alis operation IDs in the conversation; remote Define/Build/Deploy work
   continues independently, so its local watcher can stop without cancelling it.
3. Run `alis workstation handoff --agent claude --session <id> --to <alias> --json`.
4. End this turn after the coordinator returns. It waits for a recoverable
   boundary and opens an independent progress window. Polling from this source
   turn prevents the boundary. Keep the laptop open until `safe_to_close: true`.

Use `alis workstation handoff status <id> --watch --json` from another terminal.
Use `alis workstation handoff open <id>` to open the continuation in herdr.
Spaces use `alis.os`, tabs `cli.v1`, with one pane per continuation. Paired build
and Define worktrees isolate simultaneous handoffs; local files stay intact.
Normal destination trust and permission prompts still apply. Unknown background
work blocks handoff rather than being abandoned. `cancel <id>` releases the source
claim only once any launched remote continuation has acknowledged cancellation.
Uncertain remote status never permits starting a second copy locally.
