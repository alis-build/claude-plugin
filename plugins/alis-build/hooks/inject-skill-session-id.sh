#!/usr/bin/env bash
# PreToolUse hook: inject the Claude Code session_id into the Alis MCP tools
# that resolve the caller's active Context — LoadSkill / SpecIt (to prepend an
# <alis-runtime-context> block / spec the session) and RunDefine / RunBuild /
# RunDeploy (to link the resulting build-activity to the calling session via
# Correlation.context). See the hooks.json matcher for the exact tool set.
#
# Claude Code does not pass its session_id to MCP servers by default. A
# PreToolUse hook, however, receives session_id on stdin and may rewrite the
# outgoing tool arguments via hookSpecificOutput.updatedInput. This merges the
# session_id into the tool's arguments (the session_id field on the MCP
# request); the model never supplies it.
#
# Reads the hook payload (JSON) on stdin and writes the hook response to stdout.
set -euo pipefail

# jq rewrites the payload. Without it, emit nothing and exit 0 so the tool call
# proceeds unmodified (the skill falls back to its own in-markdown discovery).
if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

exec jq -c '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    updatedInput: (.tool_input + { session_id: .session_id })
  }
}'
