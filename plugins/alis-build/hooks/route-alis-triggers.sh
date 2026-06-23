#!/usr/bin/env bash
# UserPromptSubmit hook: when the user addresses Alis (a vocative "alis, ..."),
# inject the Define->Build->Deploy primer and the Alis Build routing contract.
#
# Claude Code already surfaces the Alis MCP routing instructions as a standing
# instruction, so this hook mainly (a) moves the DBD primer off always-on
# SessionStart onto the "alis" trigger to keep context lean, and (b) reinforces
# the router with a hard "do not edit code" directive. We inject ONLY when the
# user addresses Alis — "alis" is the explicit trigger word. The injected
# contract tells the model to keep routing build/fix work through SearchSkills
# for the rest of the session, so the user need not repeat "alis" every turn.
#
# Vocative "alis" matches anywhere in the prompt (e.g. "could you help add X,
# alis?"). Not gated on an ~/alis.build workspace.
#
# Whatever this script prints to stdout is added to Claude's context. The prompt
# is read from the `prompt` field of the hook payload (JSON on stdin). Claude
# Code sets CLAUDE_PLUGIN_ROOT for plugin-bundled hooks.
set -euo pipefail

# Without jq we cannot parse the prompt; emit nothing and exit 0 so the prompt
# proceeds unmodified (matches the graceful degradation of the other hooks).
command -v jq >/dev/null 2>&1 || exit 0

payload="$(cat)"
prompt="$(printf '%s' "$payload" | jq -r '.prompt // empty' 2>/dev/null || true)"
[ -n "$prompt" ] || exit 0

# Lowercase for case-insensitive matching.
lc="$(printf '%s' "$prompt" | tr '[:upper:]' '[:lower:]')"

# Vocative "Alis" (addressing the agent), e.g. "alis,", "alis:", "hey alis",
# "ask alis", "alis please/could/can/help ...". Deliberately does NOT match bare
# platform mentions like "Use Alis Build to list landing zones".
alis_vocative='(^|[^[:alnum:]])alis[[:space:]]*[,:]|(^|[^[:alnum:]])(hey|hi|ask)[[:space:]]+alis([^[:alnum:]]|$)|(^|[^[:alnum:]])alis[[:space:]]+(please|pls|could|can|would|will|help)([^[:alnum:]]|$)|,[[:space:]]*alis[[:space:]]*[?!.]*$|[[:space:]]alis[[:space:]]*[?!]'

printf '%s' "$lc" | grep -Eq "$alis_vocative" || exit 0

# DBD framing first (the mental model), then the actionable routing contract.
primer="${CLAUDE_PLUGIN_ROOT:-}/context/dbd-primer.md"
[ -f "$primer" ] && cat "$primer"

cat <<'EOF'

<alis-routing>
Alis Build routing contract — the user has engaged Alis. Keep this in mind for
this and the following turns of the session, even if they do not say "alis"
again:

- "build it" / "fix it", or any request to build, fix, add, or change something
  on the Alis Build platform — including naturally phrased asks like "could you
  help add X to my server?" — → treat as a ROUTER, not a direct task. Work out
  the intended outcome (ask ONE concise question only if it is genuinely
  ambiguous), then call the Alis Build MCP `SearchSkills` tool FIRST with that
  outcome as the query (fall back to `ListSkills` if it returns nothing). Present
  the matching skills (id, what each does, when to choose it), ask which to use,
  and only then call `LoadSkill` and follow that skill's workflow — the loaded
  skill owns execution. Do NOT inspect, write, or edit code, run
  Define / Build / Deploy, or make commits before a skill is loaded. If no skill
  fits, say so and offer `RequestSkill`.

- "spec it" / "spec it up", or a request to turn the current session into a build
  specification → call the `SpecIt` tool DIRECTLY. Do NOT route this through
  SearchSkills. It needs no arguments (session context is resolved server-side);
  pass `build_spec` only when the user names an existing one to append to. Report
  the returned BuildSpec back to the user.

Whenever a later request in this session would benefit from an Alis Build skill,
use `SearchSkills` to discover one before doing the work yourself.
</alis-routing>
EOF
