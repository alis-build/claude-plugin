#!/usr/bin/env bash
# SessionStart hook: if the Google Developer Knowledge MCP server (official
# Google docs search — cloud.google.com, Android, Flutter, Firebase, go.dev,
# web.dev) is not connected in any scope, inject a one-line nudge so Claude can
# suggest /alis-build:connect-google when Google-technology documentation
# actually comes up in the session.
#
# Detection is a cheap config read — never invoke the `claude` CLI from a hook
# (too slow for the 5s budget). User- and local-scope servers live in
# ~/.claude.json; project-scope servers live in <project>/.mcp.json. With jq we
# check actual mcpServers URLs; without jq we fall back to a plain grep, which
# can false-positive on prompt history containing the hostname — that only
# suppresses the nudge, which is safe degradation.
#
# Set ALIS_SUPPRESS_GOOGLE_MCP_NUDGE=1 to silence this permanently. Any error
# path emits nothing and exits 0 (graceful degradation, like the sibling hooks).
set -euo pipefail

[ -n "${ALIS_SUPPRESS_GOOGLE_MCP_NUDGE:-}" ] && exit 0

host="developerknowledge.googleapis.com"
claude_json="${HOME}/.claude.json"
project_mcp="${CLAUDE_PROJECT_DIR:-$PWD}/.mcp.json"

if [ -f "$claude_json" ]; then
  if command -v jq >/dev/null 2>&1; then
    jq -e --arg h "$host" '
      [(.mcpServers // {}), ((.projects // {}) | to_entries[]?.value.mcpServers // {})]
      | map(to_entries[]?.value.url // "") | any(contains($h))
    ' "$claude_json" >/dev/null 2>&1 && exit 0
  else
    grep -qs "$host" "$claude_json" && exit 0
  fi
fi
[ -f "$project_mcp" ] && grep -qs "$host" "$project_mcp" && exit 0

printf '%s\n' \
  "The Google Developer Knowledge MCP server (official Google docs search: Google Cloud, Android, Flutter, Firebase, Go, web.dev) is not connected. If the developer needs Google-technology documentation this session, suggest running /alis-build:connect-google once to set it up; do not raise this otherwise. (The developer can suppress this notice with ALIS_SUPPRESS_GOOGLE_MCP_NUDGE=1.)"
exit 0
